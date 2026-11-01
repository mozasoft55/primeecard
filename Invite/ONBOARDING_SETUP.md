# Customer onboarding portal

This portal extends the existing static invitation site. It uses the existing
vanilla HTML/JavaScript pages, Supabase PostgreSQL RPCs, Supabase Edge Functions,
private Supabase Storage, and Resend email. It does not add a React build or put
the Supabase service-role key in the browser.

## What is included

- `/onboard/`: responsive customer form for contact, wedding, event, design,
  package and payment details. UPI creates a client-side QR from the configured
  VPA and server-returned advance; cash submissions are marked for cash review.
  Package configuration can be retried from the form. Built-in design choices
  shown while the service is offline are previews only; order creation still
  requires live database-backed styles/themes, an active priced package, and
  valid Turnstile configuration. UPI is disabled in the form until a valid
  merchant VPA and name are returned by the service. If package configuration
  is unavailable, customers may submit a separate manual cash quote request;
  it is not a completed or provisioned order.
- `/dashboard/`: short-lived bearer-link access to the order, invitation
  preview, guest list and RSVP summary. Guest lists can be imported from CSV
  files exported by Excel. Native `.xlsx` parsing is not included.
- `/admin/`: magic-link sign-in for allowlisted Supabase Auth users, private
  payment queue, signed proof links, manual payment verification/rejection,
  and follow-up for cash/manual quote requests.
- `supabase/migrations/20261012230000_customer_onboarding.sql`: additive schema,
  RLS/privileges and transaction-safe RPCs. Each payment review is also written
  to the append-only `onboarding_payment_audit` table.
- `supabase/migrations/20261013210000_cash_quote_requests.sql`: private,
  rate-limited cash quote request storage and admin-only queue/status RPCs.
- `supabase/functions/`: public intake, token-protected dashboard, authenticated
  admin review and the private Resend notification-outbox worker.

The migration assumes the existing tables and required columns listed in
[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md). It checks these prerequisites before
changing the database. It does not replace or rename the invitation schema.

## Deployment order

1. Back up the Supabase project and confirm the existing schema, wedding data,
   `supabase-final-fix.sql`, and (if needed) the RSVP overload fix have already
   been applied. Keep guest/customer CSVs private.
2. Run
   [`supabase/migrations/20261012230000_customer_onboarding.sql`](./supabase/migrations/20261012230000_customer_onboarding.sql)
   in the Supabase SQL Editor. The migration is additive and wrapped in a
   transaction; fix any schema-preflight error before retrying it.
   Then run
   [`supabase/migrations/20261013210000_cash_quote_requests.sql`](./supabase/migrations/20261013210000_cash_quote_requests.sql)
   to enable the cash/manual quote fallback and its private admin queue.
3. Set real Standard/Premium prices and activate only the packages that are
   ready to sell. Money values are integer paise (`₹1 = 100 paise`); the
   following amounts are examples and must be replaced with the business's
   approved prices before activation:

   ```sql
   update public.onboarding_packages
   set list_price_paise = 500000,
       discount_paise = 0,
       advance_paise = 150000,
       features = '["Digital invitation","Guest RSVP tracking"]'::jsonb,
       active = true,
       updated_at = now()
   where package_code = 'standard';

   update public.onboarding_packages
   set list_price_paise = 1000000,
       discount_paise = 0,
       advance_paise = 300000,
       features = '["Premium invitation","Guest RSVP tracking","Priority support"]'::jsonb,
       active = true,
       updated_at = now()
   where package_code = 'premium';
   ```

   The migration deliberately inserts both packages inactive with zero prices.
   The intake page stays unavailable for order submission until a package is
   active and priced.
4. Copy `.env.example` to a private deployment note or secret manager; do not
   commit filled-in values. Configure these **Edge Function secrets** in the
   Supabase Dashboard or with the Supabase CLI:

   - `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL`
   - `APP_BASE_URL`, `APP_ALLOWED_ORIGINS` (comma-separated exact origins,
     including the production site origin and any intended local test origin)
   - `ADMIN_PANEL_URL` (the deployed website's `/admin/` URL)
   - `UPI_VPA`, `UPI_MERCHANT_NAME`
   - `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SECRET`, `OUTBOX_CRON_SECRET`

   Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` to hosted Edge Functions. For local function
   serving, provide the project values in a private, ignored local env file.
   Never place the service-role key, Resend key, Turnstile secret, or cron secret
   in `onboarding-config.js`, HTML, or any other browser-delivered file.
   For a local deployment, configure the exact browser origin too. For example:

   ```powershell
   supabase secrets set APP_ALLOWED_ORIGINS="http://127.0.0.1:8000,https://YOUR_SITE_DOMAIN"
   ```

   Replace `YOUR_SITE_DOMAIN` with the deployed site origin (scheme and host
   only, no page path). `http://localhost:8000` and `http://127.0.0.1:8000`
   are different origins; add whichever address you actually open.
5. Create a Cloudflare Turnstile widget for the website host, then replace
   `SET_CLOUDFLARE_TURNSTILE_SITE_KEY` in
   [`onboarding-config.js`](./onboarding-config.js) with its **site key**.
   Allow the website hostname in the Turnstile widget. Set the matching
   **secret key** only as the `TURNSTILE_SECRET_KEY` Edge Function secret, for
   example `supabase secrets set TURNSTILE_SECRET_KEY="YOUR_PRIVATE_SECRET"`.
   The public site key and private server secret are a matched pair. Standard
   order submission intentionally stays disabled if either value is missing or
   if the Turnstile script cannot load. The minimal cash quote request does not
   use Turnstile; it is still protected by allowed-origin checks and server
   rate limiting.
6. Verify the sending domain in Resend and set `FROM_EMAIL` to an authorized
   sender. Add an existing Supabase Auth user to the payment-review allowlist:

   ```sql
   insert into public.onboarding_admins (user_id, is_active)
   values ('AUTH_USER_UUID', true)
   on conflict (user_id) do update
   set is_active = excluded.is_active;
   ```

   Replace the UUID with the exact existing Auth user. The admin page does not
   create accounts. Restrict Supabase Auth email redirects to the
   deployed `/admin/` page and verify that the magic-link redirect works before
   accepting payments.
7. Deploy all four functions from the project root:

   ```powershell
   supabase functions deploy onboarding
   supabase functions deploy customer-dashboard
   supabase functions deploy verify-payment
   supabase functions deploy process-outbox
   ```

   Function JWT verification is configured in
   [`supabase/config.toml`](./supabase/config.toml). The public onboarding and
   customer bearer-token endpoints perform their own request checks; the admin
   function requires a Supabase Auth JWT.
8. Deploy the static site with `/onboard/`, `/dashboard/`, and `/admin/`
   directories intact. Confirm `supabase-config.js` contains only the project
   URL and browser-safe publishable/anon key.
9. Schedule `process-outbox` once per minute using a trusted scheduler. Send
   `POST https://<project-ref>.supabase.co/functions/v1/process-outbox` with
   `Content-Type: application/json`, `x-cron-secret: <OUTBOX_CRON_SECRET>`,
   and `{}` as the JSON body. The onboarding function attempts immediate email
   processing; the scheduled worker retries messages if the provider is
   temporarily unavailable. Protect scheduler configuration and logs as
   secrets.

## Payment and notification boundaries

- A UPI URI/QR only starts a payment in a user's payment app; it does not
  collect funds or confirm settlement. A UTR or uploaded image is a claim, not
  proof. `customers.advance_paid_inr` changes only after an allowlisted
  administrator verifies a received amount.
- Cash is recorded as pending cash verification. No UPI transaction reference
  or screenshot is required in cash mode.
- If online package configuration is unavailable, a customer can send a
  minimal cash/manual quote request instead. This creates a **request only**:
  it does not create a wedding, reserve a package, accept payment, or issue a
  customer dashboard. An authorized admin can review it under **Cash quote
  requests** in `/admin/`, contact the customer, confirm pricing, and mark the
  request status. The Supabase onboarding Edge Function must still be
  reachable and the exact site origin must be present in
  `APP_ALLOWED_ORIGINS`; the fallback does not bypass CORS or write requests
  to the browser. For browser connection errors, confirm the function is
  deployed and add the page's exact origin (for example,
  `http://127.0.0.1:8000` or `https://your-domain.example`) to that setting.
  Include the scheme and port, but no page path; do not use `*`. Retrying the
  same open form reuses its idempotency key.
- An HTTP `404` from `/functions/v1/onboarding` means the Edge Function is
  missing from the Supabase project configured in `supabase-config.js` (or the
  configured project URL is wrong). From this directory, an authorized
  deployer can run `supabase link --project-ref <project-ref>` followed by
  `supabase functions deploy onboarding`. Apply the cash-request migration
  separately before accepting requests; deploying the function alone does not
  create its database table/RPC.
- A successful Resend API response means the provider accepted the email
  request, not that the recipient's mailbox delivered it. Provider message IDs,
  API failures, retry attempts and payment decisions are recorded. Delivery and
  bounce webhooks are not configured by this implementation.
- Dashboard access is a random bearer link, stored hashed, revocable in
  `onboarding_access_tokens`, and expires after 30 days. The token is kept in
  the browser tab's session storage after the link is opened. Do not put
  dashboard URLs in public logs or analytics.
- One `Sample Preview Guest` with category `preview` is generated for each new
  order so the customer and administrator can open the personalized card
  immediately. Customers should delete it before sharing invitations if it is
  not a real invitee.
- Customer notifications contain a private dashboard link. Admin email contains
  order/payment details; limit the configured recipient mailbox accordingly.
- WhatsApp sharing is a customer-initiated `wa.me` link in the dashboard. This
  does not send automated WhatsApp messages.

## Local checks and outstanding production checks

Run `npm test` from this directory for the Node tests. For a static preview,
serve the site root over HTTP (for example, `python -m http.server 8000`) and
add that exact origin to `APP_ALLOWED_ORIGINS` and the Turnstile widget's test
hosts. Local Edge Function testing also requires the Supabase CLI and its
function secrets.

Before production use, validate this migration against a staging copy of the
actual Supabase schema, deploy and test every Edge Function, verify email and
payment-review workflows end to end, and load-test the chosen Supabase plan.
The pages and functions in this repository have not been deployed to your
project; no 1,000–2,000-concurrent-user capacity or live payment/email delivery
is claimed without those project-specific checks.
