# Pomedro

Pomodoro timer with Supabase auth, themed visuals (coffee cup, growing tree, cigarette “break cue” with smoke after a completed focus block), session logging, stats, and a GitHub-style contribution heatmap.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## 1. Supabase setup

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run:

   [`supabase/migrations/001_pomodoro_sessions.sql`](supabase/migrations/001_pomodoro_sessions.sql)

   This creates `pomodoro_sessions` with: `started_at`, `completed_at`, `duration_seconds`, `task_label` (work blocks only), plus RLS **select/insert** for authenticated users on their own `user_id`.

3. Under **Authentication → Providers**, enable **Email** with password sign-in.

## 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` (Project URL, e.g. `https://xxxx.supabase.co`)
- One public key: **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (legacy JWT `anon` `public`) **or** **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (`sb_publishable_…` from newer dashboard copy-paste)

Dependencies `@supabase/supabase-js` and `@supabase/ssr` are already in this repo; clients live under `src/lib/supabase/` (not `utils/`).

## 3. Run locally

```bash
cd pomedro
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then use **Timer** (`/app`) and **Stats** (`/app/stats`).

## Behavior

- **25m work / 5m short break / 15m long break** after every fourth completed work block.
- Finished phases (and “Reset phase” while running) write rows to `pomodoro_sessions`.
- Timer state is restored from `localStorage` after refresh with clock drift correction while the timer is running.

## Themes

Saved under key `pomedro-timer-theme` in `localStorage`.

## License

MIT.

---

## עברית — משתמשים לא מצליחים להתחבר

1. **משתני סביבה** — בלי `NEXT_PUBLIC_SUPABASE_URL` ומפתח ציבורי (`NEXT_PUBLIC_SUPABASE_ANON_KEY` או `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) האתר לא יוכל לדבר עם Supabase. מקומית: העתק מ-`.env.example` ל-`.env.local` והדבק מהדשבורד של Supabase → Settings → API. אחרי שינוי — הפעל מחדש `npm run dev`. בפרודקשן (למשל Vercel): הגדר את אותם משתנים בהגדרות הפרויקט ועשה deploy מחדש.
2. **ספק Auth** — ב-Supabase: Authentication → Providers → **Email** עם סיסמה.
3. **טבלאות** — הרץ את `supabase/migrations/001_pomodoro_sessions.sql` ב-SQL Editor (נדרש לסטטיסטיקות; לא חובה רק כדי להתחבר).
4. **אימייל מאושר** — אם בפרויקט מופעל “Confirm email”, אחרי הרשמה צריך לאשר מייל לפני שיש session (אז יופיע הודעה בהרשמה).
