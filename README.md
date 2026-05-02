# Am I Cooked? 🔥

Academic deadline tracker built with Next.js 14, Tailwind CSS, TypeScript.

## Quick Start

```bash
npx create-next-app@latest cooked --typescript --tailwind --app
cd cooked
npm install lucide-react
```

Then copy the files from this repo into your project.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React useState + localStorage (Supabase coming next)
- **Fonts**: Syne + DM Mono + Instrument Serif (Google Fonts)

## Pages
- `/` — Dashboard + Cooked-o-meter
- `/calendar` — Monthly calendar with deadlines
- `/analytics` — Subject breakdown + marks at risk
- `/streaks` — Progress tracker
- `/notes` — Per-subject quick notes
- `/reminders` — Priority-sorted alerts
- `/settings` — Profile + data management

## Next Steps (Backend)
1. `npm install @supabase/supabase-js`
2. Add `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Replace localStorage calls with Supabase queries
4. Add Google OAuth via Supabase Auth
