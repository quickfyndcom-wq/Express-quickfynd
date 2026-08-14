/** Super Admin allow-list (email must match Firebase Auth user) */
export const SUPER_ADMIN_EMAILS = [
  "quickfynd.com@gmail.com",
  "rohithsagar14325@gmail.com",
] as const;

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(
    email.trim().toLowerCase(),
  );
}
