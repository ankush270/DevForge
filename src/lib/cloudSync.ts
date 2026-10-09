import { supabase, isSupabaseConfigured } from './supabase';
import { Subject, ReviewLog, Note } from '@/types';

export const SUPABASE_SETUP_SQL = `-- ==========================================
-- InterviewOS Real-time Cloud Sync Migration
-- Run this in your Supabase SQL Editor (1-Click)
-- ==========================================

-- 1. Create Workspace State Table (Syncs full subject/topic/note tree)
CREATE TABLE IF NOT EXISTS public.interview_os_state (
  id TEXT PRIMARY KEY DEFAULT 'primary_workspace',
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Individual Notes Table (For easy inspection in Supabase Table Editor)
CREATE TABLE IF NOT EXISTS public.interview_os_notes (
  id TEXT PRIMARY KEY,
  topic_id TEXT,
  subject_id TEXT,
  title TEXT NOT NULL,
  content_markdown TEXT DEFAULT '',
  active_recall_data JSONB DEFAULT '[]'::jsonb,
  mastery_level TEXT DEFAULT 'RED',
  tags TEXT[] DEFAULT '{}',
  is_dsa_problem BOOLEAN DEFAULT false,
  time_complexity TEXT,
  space_complexity TEXT,
  problem_url TEXT,
  last_opened_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  srs_item JSONB
);

-- 3. Create Review Logs Table
CREATE TABLE IF NOT EXISTS public.interview_os_review_logs (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  rating TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  time_spent_seconds INT DEFAULT 0
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.interview_os_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_os_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_os_review_logs ENABLE ROW LEVEL SECURITY;

-- 5. Permissive Policies (Allows your InterviewOS app full read/write via Anon Key)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow access on interview_os_state') THEN
    CREATE POLICY "Allow access on interview_os_state" ON public.interview_os_state FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow access on interview_os_notes') THEN
    CREATE POLICY "Allow access on interview_os_notes" ON public.interview_os_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow access on interview_os_review_logs') THEN
    CREATE POLICY "Allow access on interview_os_review_logs" ON public.interview_os_review_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 6. Enable Realtime Sync
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_os_state;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`;

export interface CloudHealth {
  isConfigured: boolean;
  isConnected: boolean;
  hasTables: boolean;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<CloudHealth> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      hasTables: false,
      error: 'Supabase URL or Key is not configured in .env',
    };
  }

  try {
    const { error } = await supabase
      .from('interview_os_state')
      .select('id, updated_at')
      .limit(1);

    if (error) {
      // PGRST205 indicates the table does not exist in the schema cache
      if (error.code === 'PGRST205' || error.message.includes('not find the table')) {
        return {
          isConfigured: true,
          isConnected: true,
          hasTables: false,
          error: "Table 'interview_os_state' not created yet",
        };
      }

      return {
        isConfigured: true,
        isConnected: false,
        hasTables: false,
        error: error.message,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      hasTables: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      isConfigured: true,
      isConnected: false,
      hasTables: false,
      error: msg,
    };
  }
}

/**
 * Pushes state to Supabase in the cloud.
 */
export async function pushToCloud(
  subjects: Subject[],
  reviewLogs: ReviewLog[],
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const workspaceKey = userId ? `workspace_${userId}` : 'primary_workspace';

    // 1. Upsert consolidated state
    const { error: stateError } = await supabase
      .from('interview_os_state')
      .upsert(
        {
          id: workspaceKey,
          subjects,
          review_logs: reviewLogs,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (stateError) {
      return { success: false, error: stateError.message };
    }

    // 2. Also flatten and sync individual notes to interview_os_notes table
    const flatNotes: (Note & { subject_id: string; topic_id: string })[] = [];
    subjects.forEach((s) => {
      s.topics.forEach((t) => {
        t.notes.forEach((n) => {
          flatNotes.push({
            ...n,
            subject_id: s.id,
            topic_id: t.id,
          });
        });
      });
    });

    if (flatNotes.length > 0) {
      const records = flatNotes.map((n) => ({
        id: n.id,
        topic_id: n.topic_id,
        subject_id: n.subject_id,
        title: n.title,
        content_markdown: n.contentMarkdown,
        active_recall_data: n.activeRecallData || [],
        mastery_level: n.masteryLevel,
        tags: n.tags || [],
        is_dsa_problem: Boolean(n.isDsaProblem),
        time_complexity: n.timeComplexity || null,
        space_complexity: n.spaceComplexity || null,
        problem_url: n.problemUrl || null,
        last_opened_at: n.lastOpenedAt,
        created_at: n.createdAt,
        updated_at: n.updatedAt,
        srs_item: n.srsItem || null,
      }));

      // Non-blocking best-effort upsert to individual notes table
      Promise.resolve(
        supabase
          .from('interview_os_notes')
          .upsert(records, { onConflict: 'id' })
      ).catch(() => {});
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Push failed';
    return { success: false, error: msg };
  }
}

/**
 * Pulls state from Supabase Cloud.
 */
export async function pullFromCloud(userId?: string): Promise<{
  success: boolean;
  data?: { subjects: Subject[]; reviewLogs: ReviewLog[] };
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const workspaceKey = userId ? `workspace_${userId}` : 'primary_workspace';
    const { data, error } = await supabase
      .from('interview_os_state')
      .select('subjects, review_logs, updated_at')
      .eq('id', workspaceKey)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || !Array.isArray(data.subjects)) {
      return { success: false, error: 'No data found in cloud' };
    }

    return {
      success: true,
      data: {
        subjects: data.subjects as Subject[],
        reviewLogs: (data.review_logs || []) as ReviewLog[],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Pull failed';
    return { success: false, error: msg };
  }
}
