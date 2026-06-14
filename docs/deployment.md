# Deployment Guide — Arkanum

## Prerequisites

- Node.js 20+
- A Supabase project
- A Vercel account
- A Resend account (for email notifications)

---

## 1. Supabase Setup

### 1.1 Create the project

Go to [app.supabase.com](https://app.supabase.com) → New project.

### 1.2 Run migrations

Open the **SQL Editor** and run the migrations in order:

```
supabase/migrations/20260613000000_create_leads_table.sql
supabase/migrations/20260614000000_add_lead_status_check.sql
```

Copy and paste the content of each file, then click **Run**.

### 1.3 Enable Email Auth

Go to **Authentication → Providers → Email** and confirm it is enabled.

### 1.4 Create the admin user

Go to **Authentication → Users → Invite user** and create the admin account.
Use the same email you will set in `ADMIN_EMAILS`.

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` for local development.

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server-side only | Yes |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses | Yes |
| `RESEND_API_KEY` | Resend API key for lead email notifications | Yes (in prod) |
| `LEAD_NOTIFICATION_TO` | Email address to receive lead notifications | Yes (in prod) |
| `LEAD_NOTIFICATION_FROM` | Verified sender address in Resend | Yes (in prod) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (used in sitemap and metadata) | Yes |

Core Supabase server keys are validated at startup in production. Email, admin and site URL variables are validated close to their server-side usage or through the deployment smoke test.

Never commit `.env.local` or any file containing real values.

---

## 3. Vercel Deployment

1. Push the repository to GitHub.
2. Import the repo in [vercel.com/new](https://vercel.com/new).
3. Set all environment variables in **Project Settings → Environment Variables**.
4. Deploy.

HSTS is handled automatically by Vercel on production domains.

---

## 4. Admin Access

The dashboard is available at `/admin/leads`.

Access is controlled by two layers:
1. Supabase Auth session (email + password login at `/admin/login`).
2. `ADMIN_EMAILS` allowlist — only emails in this list can access the dashboard after login.

To add an admin:
- Create the user in Supabase Auth.
- Add their email to `ADMIN_EMAILS` (comma-separated if multiple).

---

## 5. Anti-abuse

The diagnostic form includes:

- **Honeypot field:** A hidden field bots tend to fill. If it contains a value, the submission is silently discarded.
- **In-memory rate limiter:** Maximum 5 submissions per IP per 15-minute window.

### Limitation

The rate limiter is in-memory and resets on serverless cold starts. It is best-effort for MVP. For persistent enforcement across instances, replace with a Redis/KV-backed solution in a future release.

---

## 6. Security Headers

The following headers are applied to all responses via `next.config.ts`:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

CSP is not configured in v0.7.0. Next.js generates inline scripts that require careful policy tuning. Planned for a future hardening release.
