# Firebase — QF Express (Auth only)

Login / Google / Super Admin gate use **Firebase Authentication**.
Company data (`organizations`, etc.) lives in **Supabase** — see `docs/SUPABASE.md`.

## Project

- **Project ID:** `qfexpress`
- **Auth domain:** `qfexpress.firebaseapp.com`

## Super Admin only

These emails can access `/super-admin`:

1. `quickfynd.com@gmail.com`
2. `rohithsagar14325@gmail.com`

## Enable Authentication

1. [Authentication](https://console.firebase.google.com/project/qfexpress/authentication) → Get started
2. Enable **Email/Password** and **Google**
3. Authorized domains → include `localhost`

## Customer dashboard flow

1. Merchant `/register` → Firebase account + Supabase org (`pending`)
2. Super Admin Approves in `/super-admin/customers`
3. Merchant `/login` → `/dashboard`
