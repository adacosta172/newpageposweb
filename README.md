# NewPage Office — GitHub + Vercel edition

A **new, Vercel-compatible Next.js web application** for NewPage I.T Koncept, designed to be installed on Windows with **Microsoft Edge or Chrome (PWA)**. It replaces the *hosting architecture* of the earlier PHP/MySQL v7 package with **Next.js + Supabase PostgreSQL/Auth/Storage**, because the PHP installer and local `private/config.php` file are not appropriate for Vercel's serverless environment.

**Important status:** This is a newly built **deployment candidate**, not a claim of finished production deployment or a drop-in PHP migration. It has been checked for JS/JSX syntax and includes SQL and deployment instructions, but a live Supabase database, Paystack transaction, and Vercel production build have **not** been tested here. Use staging and perform acceptance testing before entering real customer data.

## Features

- Branded premium responsive dashboard; guest **read-only demo mode** with sample data.
- Secure Supabase email/password signup, login, password reset; default role `customer`.
- Admin/staff/customer database-enforced roles (RLS), owner-only staff invitations by email.
- Customer portal: custom service requests typed in free text, artwork uploads, order status and payment history.
- Staff office: walk-in POS, multi-item orders, customer details, optional tax/discount, payments, and jobs.
- Production kanban, services, expenses, reports, CSV download, transaction history, invoices (print-to-PDF).
- Paystack online payment initialization, verification and signed webhook **only when backend secret is configured**. Manual cash, MoMo and bank payment recording without Paystack.
- Installable PWA on Windows/mobile; offline fallback **does not cache confidential data**.

## Set up your brand-new cloud database (required)

1. Create a Supabase project at https://supabase.com/dashboard. Never point the SQL at a pre-existing business database without review and a backup.
2. Open **SQL Editor**, paste and run `supabase/schema.sql` from this repository. This creates fresh tables, indexes, triggers, RLS policies and private artwork storage.
3. In Supabase **Authentication → Providers**, enable Email; set appropriate email-confirmation behavior and an SMTP service for production.
4. In Supabase **Authentication → URL Configuration**, set your Vercel production URL as Site URL, and add that URL and your intended preview URLs to the Redirect URLs allowlist.
5. In Supabase **Project Settings → API Keys**, copy the project URL and **publishable key**. Securely add the keys to Vercel environment settings (not GitHub).

### First administrator — safely provisioned by the project owner

1. Deploy the site, select **Sign in → Create account**, and register with `newpageitkoncept@gmail.com` (or the verified official owner email). Verify your email if required.
2. In your private Supabase **SQL Editor** — not in GitHub — run exactly once, after confirming the account belongs to you:

```sql
update public.profiles
set role = 'admin'
where email = 'newpageitkoncept@gmail.com';
```

3. Sign out and sign in again to refresh your role. The **Team** tab now allows you to invite staff through verified email. Public visitors cannot self-create an admin account.

## Deploy with GitHub and Vercel

See [docs/GITHUB-VERCEL-DEPLOY.md](docs/GITHUB-VERCEL-DEPLOY.md) for exact instructions and environment variable table. At a glance:

1. Create a **new private GitHub repository** called `newpage-office-cloud`. Avoid replacing the production source of your existing business website repository.
2. Upload all **contents** of this folder (the repository root must contain `package.json`, `app/`, `components/`, etc.). Do **not** upload `.env.local`, `node_modules`, MySQL `private/config.php`, or old Paystack keys.
3. Open https://vercel.com/new, import that GitHub repository, choose **Next.js**, leave root directory `/` and build command `next build`.
4. Add Vercel **Environment Variables**:

```text
NEXT_PUBLIC_SUPABASE_URL              = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY                  = YOUR_SUPABASE_SECRET_KEY (SERVER ONLY)
NEXT_PUBLIC_SITE_URL                 = https://YOUR_NEWPAGE_APP.vercel.app
PAYSTACK_SECRET_KEY                  = sk_live_... (OPTIONAL; SERVER ONLY)
```

5. Click **Deploy**, update `NEXT_PUBLIC_SITE_URL` to the actual live URL, and redeploy. No XAMPP or MySQL installer is used. Complete first-admin promotion as described above.
6. In Paystack Dashboard, set webhook URL to `https://YOUR_NEWPAGE_APP.vercel.app/api/paystack/webhook`. Configure callback/domain and verify an end-to-end sandbox transaction first. **Rotate the previously shared Paystack secret keys** before going live.

## Install on Windows

After the site is live on `https://...vercel.app`:

1. Open the address with Microsoft Edge.
2. Select `⋯ → Apps → Install this site as an app`.
3. Name it **NewPage Office**; pin to Start or taskbar.
4. Use the same owner/staff/customer account from any computer. Internet is required for business data.

Chrome installation is under the three-dot menu's *Install page as app* option on compatible versions. Android/iPhone can use Add to Home Screen.

## Local development (optional)

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your own Supabase public keys; NEVER commit it
npm run dev
# http://localhost:3000
```

## Production acceptance checklist

- [ ] Import to a new GitHub repository, connect Vercel, and confirm `npm run build` succeeds.
- [ ] Run SQL in a **new** Supabase project, enable RLS, and verify no secret is publicly exposed.
- [ ] Sign up owner and promote exact verified owner via SQL Editor.
- [ ] Test admin, staff invite, customer signup and password reset with real SMTP.
- [ ] Test customer order, staff walk-in POS, multiple line items, status change, balances and invoice print.
- [ ] Test artwork upload and file permission separation between two customer accounts.
- [ ] Test cash/MoMo/bank transactions and rejection of overpayment.
- [ ] Test Paystack **test mode** first, webhook signature and idempotency, then rotate all previously exposed secrets.
- [ ] Test PWA installation with Edge and Chrome and verify offline mode does not show private records.
- [ ] Configure Supabase backups, account security, audit retention and rate limiting.

## Data migration from PHP/MySQL v7

**Not automatic.** The PHP package uses MySQL and has a different schema. This Next.js version expects a *fresh Supabase PostgreSQL database*. A controlled data migration is required if you already have business records in the old system. Do not run the fresh schema against a live populated database or treat the new app as an automatic import of old records.

## Security notes

Only the two `NEXT_PUBLIC_...` variables belong in the browser bundle. `SUPABASE_SECRET_KEY` and `PAYSTACK_SECRET_KEY` must only exist in Vercel's encrypted Environment Variables, and **must never be committed**. The Paystack route verifies transactions server-side and the database records a gateway reference only once. Artwork lives in a private Supabase Storage bucket. SQL RLS rules enforce customer privacy and staff/admin access.
