# Deploy NewPage Office using GitHub + Vercel

## A. Why the previous installer showed "Installation is locked"

The previous downloadable NewPage v7 is a PHP/MySQL application. The screen in your screenshot was the PHP hosting installer, which requires a writable secret file (`private/install-token.txt`) and a hosted MySQL database. **Do not attempt to complete that PHP installer on Vercel.** Normal Vercel functions do not provide the persistent filesystem and PHP hosting environment that particular installer expects. This **new project is Next.js** and uses a hosted Supabase database instead. There is no installation-token file and no MySQL setup page.

## B. Unzip and create a dedicated GitHub repository

1. Extract `NewPage-Office-GitHub-Vercel.zip`.
2. Sign in to GitHub at https://github.com/new and create **Private** repository named `newpage-office-cloud`.
3. Upload the **files inside** the extracted `NewPage-Vercel-Office` folder to the root of the GitHub repository. Ensure `package.json`, `app/page.jsx`, `components/OfficeApp.jsx` and `supabase/schema.sql` are visible at the root-relative paths.
4. If using Git Bash on Windows instead of GitHub's upload dialog:

```bash
cd NewPage-Vercel-Office
git init
git add .
git commit -m "Initial NewPage Office Vercel edition"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USER/newpage-office-cloud.git
git push -u origin main
```

> The connected GitHub account already has a separate `newpagekoncept.com` website repository. **Do not replace its default branch with this office application.** A separate private repository is safer.

## C. Create Supabase database

1. Create a new project in https://supabase.com/dashboard.
2. Open **SQL Editor** → **New query**.
3. Copy and execute the file `supabase/schema.sql` (fresh project only).
4. Copy **Project URL**, **Publishable key**, **Secret key** from Supabase. Keep the Secret key private.
5. Set the Supabase Auth Site URL and Redirect URL to your production Vercel URL when available. Production invitation/reset emails require reliable SMTP.

## D. Import GitHub into Vercel

1. Visit https://vercel.com/new; log in to Vercel using GitHub.
2. Choose **Add New → Project**, authorize the GitHub repository if prompted, then **Import** `newpage-office-cloud`.
3. Choose **Framework Preset: Next.js**. Root directory is `/`. Node version as recommended by Vercel for Next 15.
4. Go to **Environment Variables** in Vercel Project Settings. Enter the variable names and values in README.md. Copy them from your personal Supabase project, *never from an example file*. Use the same values for Production and Preview as appropriate.
5. Select **Deploy**. When a new deployment is Ready, open the live `https://...vercel.app` URL.
6. If your `NEXT_PUBLIC_SITE_URL` initially had a placeholder, update it now and **Redeploy**.

## E. Create owner account

1. Open live URL → **Sign in** → **Create account** with the verified owner email.
2. Confirm email if Supabase requires it.
3. Open Supabase SQL Editor and run:

```sql
update public.profiles set role='admin' where email='newpageitkoncept@gmail.com';
```

4. Sign out and sign back in to see the owner workspace and Team area.

## F. Enable online Paystack payments

- Begin with test mode, then store the **newly rotated** production secret in Vercel as `PAYSTACK_SECRET_KEY` (server-only).
- In Paystack configure your webhook to `https://YOUR_DOMAIN/api/paystack/webhook`.
- The app validates Paystack's HMAC-SHA512 signature and separately verifies the Paystack transaction before writing a confirmed payment.
- Test an online payment of an already quoted (priced) customer order. Orders with a zero total cannot be paid until staff provides a quote.
- Manual cash, Mobile Money and bank ledger payments are supported without Paystack.

## G. PC installation

On Windows 10/11 in Edge, open the Vercel URL → `⋯` menu → **Apps** → **Install this site as an app**. You can pin to taskbar or Start. The data remains on the Supabase server, not on your Windows computer. This is a Progressive Web App, **not an `.exe` installer**.

## H. If there is a deployment error

- Build error: check the Vercel Build Logs; confirm `package.json` is at repo root and Framework is Next.js.
- Blank demo: if Supabase values are missing, the demo still opens — add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and redeploy.
- Login problem: check Supabase Authentication email settings and allowed redirect URLs.
- Database/table error: ensure `supabase/schema.sql` ran successfully on the same Supabase project used in Vercel.
- Not admin: confirm the exact email is verified and role was updated in `public.profiles`.
- Staff invite doesn't arrive: set up production Supabase SMTP, then check invite API logs and Vercel environment settings.
- Paystack error: check the server-only secret and verify Paystack webhook setup, test mode and API logs.

This document does not claim the project has already been deployed. A Vercel-hosted public URL is available only after a successful deployment in your Vercel account.
