# 🚀 Personal Interview OS (Second Brain for SDE Job Switch)
> **Comprehensive Product Requirement Document (PRD), Architecture Blueprint & Technical Specification**  
> *Last Updated: October 2026*

---

## 📌 1. Project Overview & Vision
Yeh platform ek modern software engineer ke liye **"Personal Interview Operating System"** hai. Iska primary objective sirf notes likhna nahi hai, balki **Knowledge Retention, Active Recall, aur Fast Revision** ko automate karna hai taaki company switch (SDE-1 / SDE-2 / SDE-3) ke technical rounds (OS, DBMS, CN, System Design, DSA) ek hi jagah se systematically crack ho sakein.

### Core Philosophy
1. **Retention > Collection:** Notes collect karna aasan hai, par dimag me rakhna mushkil. Spaced repetition se retention guarantee hoti hai.
2. **Active Recall > Passive Reading:** Pura page padhne ke bajaye interview question dekho aur answer dimag me recall karo.
3. **Mobile-First Revision:** Deep notes laptop par likhe jaayenge, lekin revision bed par, travel karte waqt ya metro me mobile par hoga.
4. **100% Free Tier Stack:** Zero recurring server costs — Vercel + Supabase free tiers ka maximum utilization.

---

## 📱 2. Comprehensive Layout & UI Architecture (Grilling Finalized)

Platform ka layout final grilling requirements ke mutabik **Zero-Distraction, Action-First, aur Mobile-Optimized** define kiya gaya hai:

### A. Desktop Workspace Shell (2-Pane Flexible Layout)
Desktop par 3-column clutter ke bajaye **2-Pane Clean Architecture** use hoga:
* **Pane 1 (Left Sidebar - 280px, Collapsible via `Ctrl + B`):**
  * Top: App Logo & User Profile / Sync status.
  * Quick Links: `🏠 Dashboard`, `⚡ Due Revisions (Badge: 4)`, `🔥 12-day streak`.
  * **Nested Subject Tree:**
    * `📂 Operating Systems` (Accordion toggle)
      * `↳ Memory Management`
        * `• Paging & TLB` (Active note indicator)
        * `• Page Replacement Algorithms`
      * `↳ Process Synchronization`
    * `📂 DBMS`, `📂 System Design`, `📂 DSA`.
  * Bottom: Settings, Dark/Light Mode toggle, "+ New Subject" button.
* **Pane 2 (Main Workspace - Flex 1):**
  * When browsing: Dashboard view.
  * When writing/reading: Full-width Dual Split-view Editor (50% Markdown editor, 50% Live Preview with synced scroll).

```
┌───────────────────────────┬────────────────────────────────────────────────────────┐
│  SIDEBAR (Collapsible)    │                   MAIN WORKSPACE                       │
│ ┌───────────────────────┐ │ ┌────────────────────────────────────────────────────┐ │
│ │ ⚡ Due Today (4)      │ │ │ Dual Split-View Editor / Dashboard / Focus Deck    │ │
│ │ 🏠 Dashboard          │ │ │                                                    │ │
│ ├───────────────────────┤ │ │ [ Left: Markdown Editor ] [ Right: Live Preview ]  │ │
│ │ 📂 Operating Systems  │ │ │ # Paging & TLB            # Paging & TLB           │ │
│ │   ↳ Memory Mgmt       │ │ │ - Virtual address...      - Virtual address...     │ │
│ │     • Paging & TLB    │ │ │ ```mermaid                [Rendered Diagram]       │ │
│ │ 📂 System Design      │ │ │                           :::recall [Q?] [Reveal]  │ │
│ └───────────────────────┘ │ └────────────────────────────────────────────────────┘ │
└───────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### B. Dashboard Layout ("Mission Control" Action-First)
App kholte hi unnecessary reading ke bajaye **Direct Action** par focus hoga:
1. **Top Hero Banner (Action Alert):**
   * Left: 🔥 **Current Streak (e.g. 12 Days)** + Total Mastered Topics Counter.
   * Right: **"⚡ Start Today's Revision (4 Notes Due)"** — High-visibility primary CTA button jo click karte hi seedha Revision mode shuru kar deta hai.
2. **Activity & Habit Center:**
   * **GitHub-Style Contribution Heatmap:** Full-width daily activity grid with green intensity for consistency.
3. **Quick-Resume & Decay Radar:**
   * 2-column split below the heatmap:
     * *Left:* **Recently Opened Notes** (One-click continue where you left off).
     * *Right:* **Decay Radar (At Risk 🔴/🟡):** Wo notes jo bhoolne wale ho (e.g., "OS Deadlocks: Not opened in 19 days").
4. **Subject Mastery Overview:**
   * Sleek grid cards for each Subject with progress bars (e.g. `OS: 82% 🟢`, `DBMS: 65% 🟡`).

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ 🔥 14-Day Streak  |  42 Topics Mastered    [ ⚡ Start Today's Revision (4 Due) ➔ ] │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 🟩 Daily Activity Heatmap (GitHub-Style Contribution Graph)                       │
│ ░░▒▓█░░▒▓█░░▒▓█  34 revisions completed this month                                 │
├─────────────────────────────────────────┬──────────────────────────────────────────┤
│ 🕒 Continue Where You Left Off          │ ⚠️ Decay Radar (Needs Attention)          │
│ • TCP 3-Way Handshake (1 hour ago)      │ • OS: Deadlock Prevention (21 days ago) 🔴│
│ • B-Trees vs B+ Trees (Yesterday)       │ • System Design: Consistent Hashing 🟡    │
├─────────────────────────────────────────┴──────────────────────────────────────────┤
│ 📚 Subject Mastery Cards: [OS: 82% 🟢] [DBMS: 65% 🟡] [System Design: 40% 🔴]      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

### C. Dedicated Full-Screen "Focus Deck" (Revision & Active Recall Mode)
Jab user `Start Revision` click karta hai ya note me `Practice Mode` kholta hai:
* **Zero Distractions:** Saari sidebars, top headers, aur bottom navigation completely disappear.
* **Progress Bar:** Upar minimalist bar: `Card 2 of 4 • Topic: Operating Systems`.
* **Central Card (Question View):**
  * Bada clear question ya concept prompt dikhega.
  * Tap / Spacebar / Click anywhere on card to **"Reveal Answer"**.
* **Flipped / Revealed Card:**
  * Clean formatted explanation, diagrams, and code snippets render honge.
* **Bottom Rating Controls (Keyboard shortcuts 1, 2, 3, 4 supported):**
  * `[ 🔴 1. Again (<1d) ]`  `[ 🟡 2. Hard (2d) ]`  `[ 🟢 3. Good (6d) ]`  `[ 🚀 4. Easy (16d) ]`
* **Exit Button (`Esc`):** Top-right me subtle close icon to return to Dashboard.

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ── Progress: [████████░░░░░░░░░░░░░░░░] 2 / 5 Cards                        [✕ Exit]│
│                                                                                    │
│   ┌────────────────────────────────────────────────────────────────────────────┐   │
│   │  QUESTION / ACTIVE RECALL PROMPT:                                          │   │
│   │                                                                            │   │
│   │  "Explain the difference between Paging and Segmentation in OS?"           │   │
│   │                                                                            │   │
│   │  [ Tap to Reveal Answer / Press Spacebar ]                                 │   │
│   └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                    │
│   [ 🔴 1. Again (<1d) ]  [ 🟡 2. Hard (2d) ]  [ 🟢 3. Good (6d) ]  [ 🚀 4. Easy (16d) ]   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

### D. Mobile Screen & Auto-Hiding Navigation (`< 768px`)
* **Auto-Hiding Bottom Nav:**
  * User jab note scroll down karke padhta hai, bottom navigation bar smoothly slide-down hokar chhip jata hai taaki screen 100% reading/code view ke liye free ho.
  * Halka sa bhi scroll up karne par bottom bar instantly wapas aa jata hai.
* **Mobile Editor:**
  * Two prominent pill tabs: `[ ✍️ Write ]`  `[ 👁️ Preview ]`.
  * Keyboard Quick-bar directly glued above the mobile keyboard for fast syntax injection.
* **Drawer Navigation:**
  * Top-left hamburger icon par tap karne se Subject/Topic tree bottom sheet ya slide drawer ke roop me khulta hai.

---

## 🚀 3. Complete Feature Modules

### 📚 Module 1: Hierarchical Knowledge Organization
* **3-Tier Hierarchy:** `Subject` ➔ `Topic` ➔ `Subtopic / Note`.
  * *Example:* `Operating Systems` ➔ `Memory Management` ➔ `Virtual Memory & Paging`.
* **Subject Health Card:**
  * Har subject ke upar summary badges: Total notes, Mastered count (🟢), Due for revision (🟡/🔴).
* **Breadcrumbs & Drag Reordering:** Aasan navigation aur topic priority shuffle.

### ✍️ Module 2: Developer-First Markdown Editor
* **Direct Image Paste (Zero Config):**
  * Desktop par `Ctrl + V` ya mobile image picker.
  * Image background me Supabase Storage par upload hogi aur markdown me link inject hoga: `![Architecture](https://...)`.
* **Native Mermaid.js Diagrams:**
  * Flowcharts, Process state machines, System design diagrams text-based syntax se direct render honge.
* **Code Blocks with Syntax Highlighting:**
  * C++, Java, Python, Go, SQL ke syntax highlighting ke sath 1-click copy button.
* **Auto-Save with Sync Badge:**
  * Debounced auto-save (1 second delay) + subtle green cloud sync indicator.

### 🧠 Module 3: Spaced Repetition (SRS) Engine
* **SuperMemo SM-2 Algorithm Integration:**
  * Revisions automatically schedule honge: Day 1 ➔ Day 3 ➔ Day 7 ➔ Day 16 ➔ Day 35.
* **4-Level Rating Grading:**
  1. 🔴 **Again (< 1d):** Blank ho gaye, kal wapas schedule hoga.
  2. 🟡 **Hard (2-3d):** Thoda struggle hua, short interval.
  3. 🟢 **Good (6-7d):** Standard progression.
  4. 🚀 **Easy (14-21d):** Crystal clear concept, long leap.
* **Time-Decay Warning System:**
  * Agar topic Green (Mastered) hai par 14+ din se open nahi kiya ➔ 🟡 **Yellow**.
  * Agar 30+ din se neglect kiya ➔ 🔴 **Red (Critical Decay Warning)**.
* **Metadata Footers:**
  * Har note me: *"Last opened: X days ago | Revisions count: N | Next due: Date"*.

### 🎯 Module 4: Active Recall & Mock Interview Mode
* **Blur / Toggle Questions:**
  * Special custom syntax:
    ```markdown
    :::recall[What is Thrashing in OS?]
    Thrashing occurs when the CPU spends more time swapping pages in and out of virtual memory than executing actual instructions, caused by insufficient physical memory allocation.
    :::
    ```
* **"Mock Interview Mode" Toggle:**
  * Ek click par saare answers blur ho jaayenge; screen par sirf questions dikhenge. Tap karne par answer reveal hoga.

### 📊 Module 5: Activity Heatmap & Consistency Streaks
* **GitHub-Style Contribution Heatmap:**
  * Saal bhar ka daily activity grid. Notes banana aur revise karna green intensity badhayega.
* **Streaks Tracker:**
  * 🔥 `Current Streak` aur 🏆 `Longest Streak` counters.
* **Company & Priority Filter Engine:**
  * Tags jaise `#Amazon`, `#Google`, `#HighPriority`, `#Theory`, `#Code`.
  * Targeted revision mode: Filter `[#Amazon] + [🔴 Red Status]` right before an interview round.

### 🔍 Module 6: Lightning-Fast Global Search
* `Ctrl + K` (Desktop) & Search Bar (Mobile).
* Fuzzy search across: Note title, Subject name, Markdown body, Tags, aur Recall questions.

---

## 🏗️ 4. Technical Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   Next.js 14/15 (App Router, TypeScript, React Server Comp)  │
│   Tailwind CSS (Dark mode first) + Lucide Icons             │
│   PWA (Progressive Web App - Offline Cache & Mobile App)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API & Server Actions                     │
│   Next.js Server Actions & Route Handlers                   │
│   Zod Schema Validation + TanStack Query (Data Caching)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      Database & Auth        │ │       Image Storage         │
│  PostgreSQL (Supabase)      │ │  Supabase Storage Bucket    │
│  Prisma ORM (Type-safe)     │ │  (1 GB Free, Direct Upload) │
│  Supabase Auth (Google)     │ │                             │
└─────────────────────────────┘ └─────────────────────────────┘
```

### Why PostgreSQL (SQL) over MongoDB (NoSQL)?
1. **Strict Relational Integrity:** `Subject` ➔ `Topic` ➔ `Note` ➔ `Tags` ➔ `SRS Logs` foreign keys se data hamesha structured rehta hai.
2. **Instant SRS Queries:** `WHERE next_review_at <= NOW()` B-Tree indexing ke through microsecond level par execute hoti hai.
3. **Daily Heatmap Aggregation:** `review_logs` table par `GROUP BY DATE(reviewed_at)` standard SQL se fast render hota hai.
4. **Future AI Ready:** Supabase PostgreSQL me `pgvector` built-in free hai (Notes RAG / Semantic search ke liye).
5. **Zero Server Cost:** Supabase 500 MB DB + 1 GB Storage + Auth aur Vercel Hobby hosting dono 100% free hain.

---

## 🗄️ 5. Relational Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String        @id @default(uuid())
  email           String        @unique
  name            String?
  avatarUrl       String?
  dailyReviewCap  Int           @default(15) // Fatigue protection cap
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  subjects        Subject[]
  reviewLogs      ReviewLog[]
}

model Subject {
  id          String    @id @default(uuid())
  userId      String
  title       String    // e.g. "Operating Systems", "DBMS"
  icon        String?   // Lucide icon name, e.g. "cpu", "database"
  color       String?   // Theme color token: "blue", "emerald"
  orderIndex  Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  topics      Topic[]

  @@index([userId])
}

model Topic {
  id          String    @id @default(uuid())
  subjectId   String
  title       String    // e.g. "Memory Management", "Concurrency"
  orderIndex  Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  subject     Subject   @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  notes       Note[]

  @@index([subjectId])
}

enum MasteryLevel {
  RED       // Weak / Critical Decay
  YELLOW    // Moderate / Due Soon
  GREEN     // Mastered
}

model Note {
  id               String        @id @default(uuid())
  topicId          String
  title            String        // Subtopic: e.g. "Paging, TLB, Page Faults"
  contentMarkdown  String        @db.Text
  activeRecallData Json?         // Array of { question: string, answer: string }
  masteryLevel     MasteryLevel  @default(YELLOW)
  isDsaProblem     Boolean       @default(false)
  timeComplexity   String?       // e.g. "O(N log N)"
  spaceComplexity  String?       // e.g. "O(1)"
  problemUrl       String?       // e.g. "https://leetcode.com/problems/..."
  lastOpenedAt     DateTime      @default(now())
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  topic            Topic         @relation(fields: [topicId], references: [id], onDelete: Cascade)
  srsItem          SRSItem?
  reviewLogs       ReviewLog[]
  tags             NoteTag[]

  @@index([topicId])
  @@index([masteryLevel])
  @@index([isDsaProblem])
}

model SRSItem {
  id              String    @id @default(uuid())
  noteId          String    @unique
  repetitionCount Int       @default(0)
  intervalDays    Int       @default(1)
  easeFactor      Float     @default(2.5)
  nextReviewAt    DateTime  @default(now())
  lastReviewedAt  DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  note            Note      @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([nextReviewAt])
}

enum ReviewRating {
  AGAIN
  HARD
  GOOD
  EASY
}

model ReviewLog {
  id               String       @id @default(uuid())
  userId           String
  noteId           String
  rating           ReviewRating
  timeSpentSeconds Int          @default(0)
  reviewedAt       DateTime     @default(now())

  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  note             Note         @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([userId, reviewedAt])
  @@index([noteId])
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique // e.g. "Amazon", "HighFrequency"
  notes     NoteTag[]
}

model NoteTag {
  noteId    String
  tagId     String

  note      Note      @relation(fields: [noteId], references: [id], onDelete: Cascade)
  tag       Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([noteId, tagId])
}
```

---

## 🧮 6. Algorithms & Business Rules

### A. Spaced Repetition (SM-2) Logic
```typescript
function calculateNextSRS(
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY',
  prevInterval: number,
  prevRepetition: number,
  prevEaseFactor: number
) {
  let interval = prevInterval;
  let repetition = prevRepetition;
  let easeFactor = prevEaseFactor;

  if (rating === 'AGAIN') {
    repetition = 0;
    interval = 1;
  } else {
    // Quality map: EASY = 5, GOOD = 4, HARD = 3
    const quality = rating === 'EASY' ? 5 : rating === 'GOOD' ? 4 : 3;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = rating === 'HARD' ? 2 : 6;
    } else {
      interval = Math.round(prevInterval * easeFactor * (rating === 'HARD' ? 1.2 : 1.0));
    }
    repetition += 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { intervalDays: interval, repetitionCount: repetition, easeFactor, nextReviewAt };
}
```

### B. Auto-Decay Formula
* Note ka calculated status:
  * If `days_since_last_review <= intervalDays` ➔ 🟢 **GREEN (Mastered)**
  * If `days_since_last_review > intervalDays && days_since_last_review <= intervalDays + 14` ➔ 🟡 **YELLOW (Due Soon)**
  * If `days_since_last_review > intervalDays + 14` ➔ 🔴 **RED (Critical Decay)**

---

## 🗺️ 7. Phased Implementation Roadmap

1. **Phase 1: Project Setup & Modern Theme Architecture**
   * Next.js App Router, TypeScript, Tailwind CSS configuration with sleek dark mode palette.
   * Responsive layout shell: Mobile Bottom Nav + Drawer + Desktop Sidebar.
2. **Phase 2: Database Schema & Mock / Local State Seed**
   * Prisma schema setup and local seed data (Sample subjects: OS, DBMS, System Design).
   * Fast CRUD for Subjects, Topics, and Notes.
3. **Phase 3: The Split / Tabbed Markdown Editor**
   * Markdown parser with Mermaid.js, Prism syntax highlighting, and `:::recall` custom tag.
   * Direct image paste handler with storage abstraction.
4. **Phase 4: Revision Hub & Heatmap**
   * Daily revision queue query.
   * 4-button SM-2 grading interface.
   * GitHub-style daily review heatmap component.
5. **Phase 5: Search, Filter & PWA Polish**
   * `Ctrl + K` global command palette.
   * Tags filter (`#Amazon`, `#Google`).
   * Mobile touch optimization, manifest.json & PWA service worker.

---

## 🎨 8. Visual Design System & UI Specifications (Grilling Finalized)

Platform ka visual identity modern developer-first principles par based hai:

### A. Dual-Theme Color Architecture (Dark & Light)
User ko day-to-day comfort ke liye **Full Dark and Light Mode Support** milega:

| Design Token | Dark Mode (Default / Dev-First) | Light Mode (Reading & Daytime) |
| :--- | :--- | :--- |
| **Canvas Background** | `#09090b` (Deep Pitch Zinc-950) | `#fcfcfd` / `#f8fafc` (Ultra-clean Paper Slate) |
| **Panel / Card Surface** | `#121215` / `#18181b` (Subtle Zinc-900) | `#ffffff` (Crisp White Card) |
| **Card Borders** | `1px solid #27272a` (Zinc-800) | `1px solid #e4e4e7` (Zinc-200) |
| **Primary Text** | `#f4f4f5` (Zinc-100 High-contrast) | `#09090b` (Zinc-900 Deep Contrast) |
| **Muted Text / Secondary**| `#a1a1aa` (Zinc-400) | `#71717a` (Zinc-500) |
| **Code Block Background**| `#0d0d10` (High-contrast obsidian) | `#f1f5f9` (Soft Slate) |

### B. Typography Pair (Geist Suite)
* **UI Font (Headings, Navigation, Cards, Labels):** `Geist Sans`
  * Ultra-crisp geometric developer sans-serif, designed specifically for high-density dashboards.
* **Code & Editor Font (Markdown input, Code blocks, Math formulas):** `Geist Mono`
  * Clean character differentiation (`0` vs `O`, `l` vs `1`), crystal-clear indentation readability.

### C. Surface Treatment & Elevation (Linear-style Dev-Tool)
* **Corner Radii:**
  * Cards, Modals, Editor Containers: `rounded-xl` (12px).
  * Buttons, Inputs, Badges: `rounded-lg` (8px).
  * Status Pills: `rounded-full`.
* **Hover State & Ambient Glow:**
  * Interactive cards par subtle `border-zinc-700` highlight aur soft ambient glow (`shadow-sm hover:shadow-indigo-500/10`).
  * Zero heavy 3D skeuomorphic shadows; flat, sharp, modern SaaS aesthetic.

### D. Semantic Brand Accents & Status Tokens
* **Primary Interactive Accent:** Electric Violet / Indigo (`#6366f1` / `#8b5cf6`)
  * Buttons, active navigation pills, primary CTAs, selection rings.
* **Mastery & Health Tokens:**
  * 🟢 **Mastered / Success:** Emerald (`#10b981` / `bg-emerald-500/15 text-emerald-400`)
  * 🟡 **Due Soon / Warning:** Amber (`#f59e0b` / `bg-amber-500/15 text-amber-400`)
  * 🔴 **Critical Decay / Again:** Rose Crimson (`#f43f5e` / `bg-rose-500/15 text-rose-400`)
  * 🔥 **Streak / Motivation:** Vibrant Orange (`#f97316` / `bg-orange-500/15 text-orange-400`)
* **Company Tags:** Subtle dark badges with accent borders (e.g. `#Amazon` in slate with subtle orange dot, `#Google` with subtle blue dot).

### E. Micro-Interactions & Ergonomics
* **Smooth State Transitions:** All hover, modal open, and tab switches use `transition-all duration-200 ease-in-out`.
* **Active Recall Reveal Flip:** Card answer reveal par smooth opacity + vertical slide-in (200ms).
* **Code Copy Feedback:** Copy icon instant checkmark transition with *"Copied to clipboard"* toast.
* **Auto-Save Status:** Subtle pulsing green dot: *"Saving..."* ➔ *"Saved to cloud"*.

---

## ⚡ 9. User Experience (UX) & Interaction Patterns (Grilling Finalized)

Platform ka user experience friction-free speed, ergonomics, aur learning motivation ke around designed hai:

### A. Hybrid Note Creation Workflow
Notes create karne me 0 friction rahegi:
1. **Universal Quick-Capture (`Ctrl / Cmd + N`):**
   * App me kisi bhi screen par ho, `Ctrl + N` dabane par spotlight modal khulta hai.
   * Auto-suggest inputs: Subject (e.g. `OS`) ➔ Topic (e.g. `Memory Mgmt`) ➔ Title (e.g. `TLB Hit vs Miss`).
   * Press `Enter` ➔ Direct Split-Editor me cursor focus ke sath land karo.
2. **Contextual Sidebar `+` Button:**
   * Sidebar me kisi bhi Topic par hover karne par chhota `+` icon dikhega.
   * Click karne par inline input field khulega, naam likho aur `Enter` dabao — note wahi create ho jayega.

### B. Power-User Keyboard Shortcuts Map
Full keyboard-first navigation for maximum developer efficiency:

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Ctrl / Cmd + K` | Global | Open Command Palette / Fuzzy Search across everything |
| `Ctrl / Cmd + N` | Global | Universal Quick-Capture Modal |
| `Ctrl / Cmd + B` | Global | Toggle Sidebar collapse / expand |
| `Ctrl / Cmd + S` | Editor | Force Save note immediately (auto-save runs in background) |
| `Space` or `Enter` | Focus Deck | Flip card / Reveal Active Recall answer |
| `1` | Focus Deck | Grade card as 🔴 **Again** (Interval resets to 1 day) |
| `2` | Focus Deck | Grade card as 🟡 **Hard** (Interval * 1.2, due in 2 days) |
| `3` | Focus Deck | Grade card as 🟢 **Good** (Standard progression, due in 6 days) |
| `4` | Focus Deck | Grade card as 🚀 **Easy** (Long jump, due in 16+ days) |
| `Esc` | Focus Deck / Modal | Close modal or exit Focus Deck back to Dashboard |

### C. Gamified Revision Completion Hub (Dopamine Loop)
Jab daily revision queue ke saare cards khatam honge, user ko motivating milestone screen milegi:
* 🎊 **Confetti Burst Animation:** Canvas confetti celebrate karega session finish hona.
* 🔥 **Streak Upgraded Banner:** *"Awesome job! Current Streak: Day 15 🔥 (+1 today)"*.
* 📋 **Session Review Matrix:**
  * Har revised topic ka card, uspar diya gaya rating badge (`Good`, `Hard`, etc.), aur exact date kab wo wapas aayega (*"Next review on 16 Oct"*).
* 🎯 **Two Action Options:**
  1. **Primary Button:** `🎯 Review 5 More Weak Topics (🔴 Red)` — high-drive study sessions ke liye.
  2. **Secondary Button:** `🏠 Return to Dashboard` — restful completion.

### D. Offline-First Resilience (Metro / Commute Study Ready)
* **IndexedDB Local Cache:**
  * Saare subjects, topics, notes, aur active SRS items client-side IndexedDB me automatically mirror rahenge.
* **Offline Revision & Outbox Queue:**
  * Metro me travel karte waqt bina internet ke bhi notes padhe ja sakte hain aur rating di ja sakti hai.
  * Har rating aur edit local outbox queue me store hota hai.
* **Auto-Reconciliation on Reconnect:**
  * Jaise hi device internet se reconnect hoga, background sync silently saari outbox entries ko Supabase PostgreSQL se sync kar dega.
  * Subtle sync badge indicator:
    * 🟢 *Synced to cloud*
    * 🟡 *Syncing (3 pending changes)*
    * ⚪ *Offline mode (changes saved locally)*

---

## 🧩 10. Advanced Domain Capabilities: DSA, Anti-Lock-in & Sprint Mode (Grilling Finalized)

Platform me interview preparation ke advanced real-world edge cases ko tackle karne ke liye 4 dedicated systems shamil hain:

### A. 1-Click Complete Markdown ZIP Export (Zero Vendor Lock-in)
User ka data 100% portable rahega:
* **Export Format:** 1-Click download of a structured `.zip` archive.
  * Structure:
    ```
    📦 interview_notes_backup/
       ├── 📁 Operating_Systems/
       │   ├── 📁 Memory_Management/
       │   │   ├── Paging_and_TLB.md
       │   │   └── Page_Replacement.md
       │   └── 📁 Concurrency/
       ├── 📁 System_Design/
       ├── 📁 DSA/
       └── 📁 assets/ (All embedded images & screenshots)
    ```
* **Obsidian & Notion Ready:** Standard Markdown format with YAML frontmatter:
  ```markdown
  ---
  title: "Paging & TLB"
  subject: "Operating Systems"
  topic: "Memory Management"
  mastery: "GREEN"
  tags: ["#CoreOS", "#Amazon", "#Paging"]
  last_reviewed: 2026-10-10
  ---
  ```
  Isse user kabhi bhi bina kisi loss ke Obsidian ya kisi aur tool me switch kar sakta hai.

### B. Specialized DSA (Coding Problem) Engine
Coding round preparation ke liye notes me dedicated DSA metadata support:
* **Problem Header Badges:**
  * ⏱️ **Time Complexity:** Chip badge (e.g. `O(N log N)`)
  * 💾 **Space Complexity:** Chip badge (e.g. `O(1)`)
  * 🔗 **Problem Source:** Direct external link (e.g. LeetCode #146: LRU Cache / GFG).
* **Structured 3-Tab Section:**
  1. 💡 **Intuition & Approaches:** Brute-force vs Optimal approach, pattern recognition (Two Pointer / Monotonic Stack / Sliding Window).
  2. ⚠️ **Tricky Edge Cases:** Empty input, single element, duplicates, integer overflow pitfalls.
  3. 💻 **Multi-Language Solutions:** Tabbed code snippets (C++ / Java / Python) with syntax highlighting.

### C. Smart Daily Cap & Burnout Protection
Agar kisi din busy schedule ki wajah se 40+ cards due ho jayein:
* **Daily Review Cap (Default: 15 cards, user-customizable):**
  * System kabhi bhi candidate ko 40 cards ka mental overload nahi dega.
  * Formula: Top 15 cards are picked based on `priority_score = decay_weight * difficulty_weight`.
  * Status message: *"Today's Target: 15 Cards • 25 cards scheduled for tomorrow (Burnout Protected)"*.
* **Consistency Protection:** 15 cards complete karne par bhi daily streak 🔥 increment ho jayegi!

### D. "Interview Sprint" Mode (Targeted Company Cramming)
Company interview se 2-3 din pehle:
* Candidate dashboard par **"⚡ Interview Sprint"** button dabayega.
* Company tag select karega (e.g. `#Amazon`, `#Google`).
* System instant focused queue create karega:
  1. Only topics tagged with that company.
  2. Prioritizing 🔴 Red (decayed) and 🟡 Yellow (due) concepts.
  3. Irrelevant topics filter out ho jayenge taaki high-yield topics par maximum focus rahe.



