# Adding Supabase Auth + Database

## 1. Install
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 2. Environment
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Create Supabase client
```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## 4. Database schema
```sql
-- Run in Supabase SQL editor
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  subject text,
  type text default 'assignment',
  deadline date not null,
  marks int default 0,
  notes text default '',
  done boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table tasks enable row level security;
create policy "Users own their tasks"
  on tasks for all using (auth.uid() = user_id);
```

## 5. Replace localStorage in store.tsx
```ts
// Instead of ls.get / ls.set, use:
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', user.id)
  .order('deadline', { ascending: true })
```

## 6. Google OAuth login
```ts
// In your login page:
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/dashboard' }
})
```

## 7. Protect routes
```ts
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.redirect(new URL('/login', req.url))
  return res
}
export const config = { matcher: ['/dashboard/:path*', '/calendar', '/notes/:path*'] }
```
