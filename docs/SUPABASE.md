# Supabase — QF Express (database)

**Auth** is **Firebase**. **Database** is **Supabase** Postgres.

## 1. Tables (one-time)

1. Open [SQL Editor](https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql/new)
2. Run `supabase/migrations/001_init.sql` (or use `/setup`)

## 2. Env (`.env.local`)

```
# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# …other Firebase public keys

# Supabase DB
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

## 3. Super Admin emails

Hard-coded in `src/lib/admins.ts` (Firebase sign-in):

- `quickfynd.com@gmail.com`
- `rohithsagar14325@gmail.com`

## 4. Flow

1. Merchant `/register` → Firebase Auth user + Supabase `organizations` row (`pending`)
2. Super Admin Approves in `/super-admin/customers`
3. Merchant `/login` (Firebase) → `/dashboard` if `active`

## APIs

| Route | Use |
|-------|-----|
| `GET/POST /api/v1/orgs` | Merchants |
| `GET/PATCH /api/v1/orgs/[id]` | Approve |
| `GET /api/v1/stats` | Overview |
| `GET /api/v1/supabase/health` | Health |
