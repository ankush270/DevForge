# DevForge — Personal Interview Operating System

> **A developer-first knowledge retention, active recall, and spaced repetition platform engineered for technical software engineering interviews.**

DevForge is designed to solve a fundamental problem in software engineering interview preparation: **passive note-taking fails under interview pressure**. Engineers often read hundreds of pages of Operating Systems, DBMS, Distributed Systems, and System Design notes, only to forget the majority of critical concepts within 48 hours without systematic repetition.

---

## 🚀 Key Architectural Pillars

### 1. SuperMemo SM-2 Spaced Repetition Engine
- Implements the SM-2 recurrence relation to calculate optimal memory reinforcement intervals:
  $$\text{Interval}(n) = \text{Interval}(n-1) \times \text{EF}$$
- Adaptive Ease Factors ($1.3 \le \text{EF} \le 2.5$) adjust based on recall difficulty (Again, Hard, Good, Easy).
- **Decay Radar:** Automatically surfaces expiring concepts before critical interview rounds.

### 2. Multi-Perspective Modular Study Modes
Every topic is organized into dedicated perspective tabs rather than a single overwhelming document:
- 📖 **In-Depth:** Deep architectural theory, kernel internals, and RFC protocols.
- ⚡ **Quick Tricks:** Mnemonics, mental models, and quick formulas for estimation.
- 🎯 **Interview Traps:** Tricky edge cases and counter-intuitive questions.
- 🛠️ **Production Code:** Concrete implementations in Linux C/C++, Java, Go, or Python.
- ➕ **Custom Modes:** Extensible custom perspectives with configurable icons.

### 3. Active Recall & Inline Practice
- Native spoiler blocks (`:::recall[Question]`) hide critical solutions until tapped.
- In-place Practice Mode blurs text to force active memory retrieval before verification.

### 4. Interactive Mermaid.js Architectural Diagrams
- Native rendering of Mermaid code blocks directly inside notes with zero external plugin overhead.
- Flowcharts, sequence diagrams, and relational database schemas render seamlessly.

### 5. Local-First Sovereignty + Supabase PostgreSQL Real-Time Sync
- **100% Offline-Capable:** Operates instantly from browser `localStorage` without requiring an account.
- **Supabase Cloud Sync:** Connects to your personal Supabase project for encrypted multi-device synchronization.
- **Zero Lock-In:** 1-click Markdown ZIP export allows you to take your entire knowledge base anywhere at any time.

---

## ⌨️ Global Keybindings

| Keybinding | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + K` | Command Palette & Search | Instant fuzzy search across all notes, topics, and actions |
| `Ctrl + N` | Quick Capture | Open modal to capture ideas and interview questions instantly |
| `Ctrl + B` | Toggle Sidebar | Collapse or expand sidebar for distraction-free study |
| `Esc` | Dismiss / Return | Close modal or return to the main workspace |
| `Space` / `Enter` | Reveal Flashcard | Expose hidden active recall answer during revision sprints |
| `1` / `2` / `3` / `4` | Grade Card | Grade review with SM-2 intervals (Again, Hard, Good, Easy) |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ankush270/DevForge.git
cd DevForge

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Cloud Sync Configuration (Optional)
To connect your Supabase PostgreSQL database:
1. Create a free project at [supabase.com](https://supabase.com).
2. Set your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Open the **Cloud Sync** modal in DevForge and run the provided SQL setup script in your Supabase SQL editor.

---

## 📦 Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **UI & Styling:** Tailwind CSS v4, Lucide React
- **Diagrams:** Mermaid.js
- **Database / Sync:** Supabase JS Client & PostgreSQL
- **Typography:** Plus Jakarta Sans & JetBrains Mono

---

## 📄 License

MIT License — free and open source.
