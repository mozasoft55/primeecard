# Royal Wedding Cards
## Technical Overview, Software Requirements, Delivery Status, and Operations

**Document status:** Project handover / requirements baseline  
**Prepared:** 15 October 2026  
**Audience:** Product owner, business operations, developers, Supabase administrator, QA, and deployment support  
**Repository root:** `Invite/`  
**Production status:** Not verified. The customer onboarding endpoint has been reported to return HTTP 404.

> This document describes what is present in the repository and what is still
> required to operate the product. Code existing locally does not prove that a
> migration has been applied, a function deployed, a secret configured, email
> delivered, or a performance target achieved.

## 1. Executive summary

Royal Wedding Cards is a static, browser-delivered wedding invitation and
customer-management website backed by Supabase. It is implemented with plain
HTML, CSS, and JavaScript modules rather than a React/Vite application.
PostgreSQL stores wedding and customer data; Supabase Edge Functions provide
server-side actions; Resend is the planned transactional email provider.

The product is intended to support:

1. A guest opening a private invitation link, viewing the wedding card and
   programme, and submitting an RSVP.
2. A prospective customer submitting wedding/order information through
   `/onboard/`.
3. A customer using a private `/dashboard/` link to manage invitation guests
   and see RSVP activity after a real order has been provisioned.
4. An authorized administrator using `/admin/` to review payment claims and
   follow up on manual quote requests.

The repository includes implementation for these flows, SQL migrations,
configuration examples, setup documentation, and 37 automated Node tests.
However, the onboarding endpoint previously returned **404** in the user's
browser. The Supabase CLI, Deno, and PostgreSQL client/validator were not
available in the inspected workstation, and the code has not been proven
against the live Supabase project. Deployment and production readiness are
therefore outstanding.

## 2. Product goals and scope

### 2.1 In scope

- Replace spreadsheet/Apps Script runtime calls with Supabase-backed
  invitation lookup and RSVP submission.
- Display personalized invitation cards using a guest invitation code.
- Display wedding details, event timeline, theme, and invitation design.
- Support RSVP states: attending, declined, and tentative.
- Provide a customer onboarding flow for contact, wedding, programme, design,
  package, and payment information.
- Provision a wedding/customer order transactionally after a valid paid-order
  submission.
- Offer a separate manual cash quote request when package configuration is
  unavailable.
- Provide secure customer dashboard access for a provisioned order.
- Let customers add, edit, remove, and import guest information from CSV.
- Build individual invitation links and initiate WhatsApp sharing through a
  user-clicked link.
- Provide administrator payment review and quote-request follow-up.
- Queue order emails for delivery/retry through Resend.

### 2.2 Out of scope or not currently implemented

- Automatic WhatsApp messaging through WhatsApp Business API.
- Automatic bank reconciliation or payment-provider verification.
- Taking card payments or collecting UPI funds directly.
- Native `.xlsx` workbook upload; customers must export a CSV from Excel.
- Automatic order creation from a cash quote request.
- Automatic email notification for manual cash quote requests.
- Production load-test evidence for 1,000–2,000 simultaneous users.
- Verified delivery/bounce processing for Resend email.
- Claims that the live project is deployed or production-ready.

## 3. User roles and permissions

| Role | Intended actions | Access boundary |
| --- | --- | --- |
| Invitation guest | View the card addressed to their invitation code; send an RSVP | Possession of an invite code identifies the invitation. Do not treat it as a customer login. |
| Prospective customer | Submit order details or ask for a manual cash quote | Public onboarding endpoint, origin checks, server-side validation, and rate limits |
| Provisioned customer | View order/card, manage guests, monitor RSVPs | Random bearer token; token hash is stored server-side and the token expires after 30 days |
| Administrator | Review and verify/reject payments; follow up quote requests | Existing Supabase Auth user plus active row in `public.onboarding_admins` |
| Service worker | Provision orders, read private data, send email | Supabase service-role credential held only by server-side Edge Functions |

The order reference alone is not intended to authorize dashboard access. The
dashboard bearer link is sensitive: do not publish it or include it in public
analytics/logs.

## 4. User journeys and product behavior

### 4.1 Invitation and RSVP

1. A guest opens the main site with `?code=<private-invite-code>`.
2. `index.html` asks `api.js` to call the `lookup_invitation` database RPC.
3. The response includes the matching guest, wedding card data, and event
   programme; the page loads the selected template.
4. The guest chooses attending, declined, or tentative and submits the RSVP.
5. `submit_invitation_rsvp` derives the wedding and invitation limit from the
   invite code. The browser does not decide which wedding owns the invitation.
6. After a successful save, the page prevents an accidental duplicate form
   submission.
7. Without an invite code, the page displays its personalized-invitation
   fallback rather than a guest record.

### 4.2 Paid onboarding order

1. Customer opens `/onboard/` and enters their contact information, couple and
   family details, date, venue, programme, template, and theme.
2. The page requests active package and theme/style configuration from the
   onboarding Edge Function.
3. The customer selects a configured package and UPI or cash settlement.
4. For UPI, the page may build a UPI payment URI and QR using the configured
   merchant VPA and server-provided amount. A QR launches a payment app; it
   does not confirm or collect funds. A supplied UTR/image is only a claim.
5. Standard order submission requires configured Cloudflare Turnstile.
6. The onboarding Edge Function validates the request, then calls the
   transactional `provision_new_customer` RPC. Prices are read from trusted
   package configuration, not accepted as browser authority.
7. A successful order creates customer, wedding, event, guest-preview,
   payment, dashboard-token, and email-outbox records in the database
   transaction.
8. Email is attempted through the outbox/Resend flow. Delivery still needs
   provider and mailbox verification.

Packages are intentionally inserted inactive with zero prices by the migration.
The paid-order form must remain unavailable until the business approves and
configures actual prices.

### 4.3 Manual cash quote fallback

1. If package configuration cannot be loaded, the customer can choose the
   separate “cash / manual quote” path.
2. The path asks for a name and a reachable phone or email; it does not require
   selecting a package, theme, or event timeline.
3. The page posts `{ intent: "cash_quote_request", input: ... }` to the
   onboarding Edge Function.
4. The server validates origin, input size, idempotency, contact information,
   and an IP-derived rate limit before calling
   `submit_cash_quote_request`.
5. A successful request receives a `CASH-...` reference and appears in the
   authorized admin queue.
6. This is a **request only**. It does not create a wedding, order, payment,
   package reservation, or customer dashboard.
7. Admins must check `/admin/` and contact the customer. No automatic email
   notification is currently sent for this quote-only flow.

**Known production blocker:** the user reported HTTP 404 when submitting this
request. The frontend now has a specific explanation for a missing onboarding
function, but no remote deployment was performed as part of this repository
work.

### 4.4 Customer dashboard

- Customer opens the private dashboard URL received for a provisioned order.
- The page extracts the one-time-in-URL bearer token, stores it in
  `sessionStorage`, and removes it from the address bar.
- It requests order, wedding, programme, guests, and RSVP data from
  `customer-dashboard`.
- The customer can add/edit/delete guests and import a CSV exported from Excel.
- The page generates invitation URLs using individual invite codes and can
  open a prefilled WhatsApp share link.
- The dashboard link is not a public order reference. It expires after 30 days
  according to the current setup documentation.

### 4.5 Administrator review

- Admin signs in with a Supabase Auth magic link using an existing account.
- An account must already be registered as active in
  `public.onboarding_admins`.
- Admin can see payment details, access a private signed proof URL, and verify
  or reject the payment claim with an audit entry.
- Admin can list open cash quote requests and mark them contacted, converted,
  or closed.
- Marking a quote converted is a status update only; it does not provision an
  order automatically.

## 5. Architecture

```text
Guest/customer/admin browser
        |
        | HTTPS static HTML/CSS/JavaScript modules
        v
Static website host
        |
        +---- Invitation API ----------------------------+
        |                                                |
        +---- Supabase Edge Functions                    |
                     |                                   |
                     | service-role RPCs (server only)   |
                     v                                   v
             Supabase PostgreSQL                  Private Storage
                     |
                     +---- notification outbox
                                  |
                                  v
                             Resend API

Cloudflare Turnstile protects standard paid-order submission.
Cash quote submissions bypass Turnstile, but retain origin checks,
validation, idempotency, payload limits, and rate limiting.
```

### 5.1 Main technologies

- Static front end: HTML5, CSS, browser JavaScript modules.
- Database/API: Supabase PostgreSQL, PostgREST RPCs, Supabase Edge Functions.
- Server runtime: Supabase Edge Functions using Deno and
  `@supabase/supabase-js`.
- QR generation: vendored local JavaScript QR-code library.
- Email: Resend API via notification outbox.
- Bot prevention: Cloudflare Turnstile for standard order submission.
- Payment: UPI URI/QR or manual cash bookkeeping; no payment gateway is
  configured in this code.
- Guest import: CSV parsing in browser; no server-side `.xlsx` parser.
- Tests: Node.js built-in `node:test`.

There is no front-end build pipeline shown in `package.json`; the site is served
as static files. Do not assume that `VITE_*` entries in `.env.example` are
automatically loaded by the website.

## 6. Routes and endpoints

### 6.1 Website routes

| Route | Purpose |
| --- | --- |
| `/` or `/index.html?code=...` | Individual guest invitation and RSVP |
| `/share.html?id=<wedding-id>` | Wedding card preview/share surface |
| `/studio.html?id=<wedding-id>` | Design preview/studio surface |
| `/guest-list.html?w=<wedding-id>` | Guest-link/QR utility |
| `/onboard/` | Customer order and manual quote intake |
| `/dashboard/?order=...` | Customer dashboard landing page; access still requires its private bearer token |
| `/admin/` | Admin payment review and cash quote follow-up |

### 6.2 Supabase Edge Function routes

All endpoints use the configured project URL:

| Function route | Purpose / actions |
| --- | --- |
| `/functions/v1/onboarding` | `GET` loads packages/design/payment configuration; standard `POST` provisions order; JSON intent `cash_quote_request` saves a separate quote request |
| `/functions/v1/customer-dashboard` | Bearer-token `POST` actions: `load`, `add_guests`, `update_guest`, `delete_guest` |
| `/functions/v1/verify-payment` | Authenticated admin actions: `list`, `proof`, payment verify/reject, `list_cash_requests`, `update_cash_request` |
| `/functions/v1/process-outbox` | Trusted scheduled worker; claims queued email and records delivery/retry result |

The shared HTTP helper enforces an exact configured origin allowlist. An origin
includes scheme and host/port and excludes page path. For example,
`http://localhost:8000` is different from `http://127.0.0.1:8000`.

## 7. Data model and data handling

### 7.1 Invitation data

The invitation schema is documented in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
Its principal entities are:

| Table | Business meaning |
| --- | --- |
| `weddings` | Couple, event date, selected template, theme, wedding identifier |
| `wedding_details` | Names, family copy, ceremony, venue, map, card copy, slug/media settings |
| `events` | Ordered programme/timeline rows for a wedding |
| `guests` | Invitee name, invitation code, allowed guest count, category, optional contact |
| `rsvps` | Latest RSVP status, attending count, wishes, submission timestamps |
| `rsvp_contacts` | Contact details intentionally shown on the invitation card |
| `themes` | Reusable color palette definitions |
| `styles` | Available invitation template/style catalogue |
| `customers` | Customer and order/payment summary data |

### 7.2 Onboarding and operations data

The main onboarding migration creates:

- `onboarding_packages`: approved package names, integer-paise prices/features,
  and active/inactive status.
- `onboarding_orders`: order reference, idempotency, pricing snapshot,
  statuses, and access-token hash/expiry.
- `onboarding_payments`: expected/claimed/verified amount, UPI/cash status,
  external reference, and optional private proof path.
- `onboarding_payment_audit`: append-only administrator payment decisions.
- `onboarding_access_tokens`: hashed/revocable customer access records.
- `onboarding_rate_limits`: request rate-limit counters.
- `notification_outbox`: queued email and retry state.
- `onboarding_admins`: Supabase Auth user allowlist.

The cash quote migration adds:

- `onboarding_cash_requests`: private customer contact/wedding request details,
  reference, idempotency hash, status, and timestamps.

### 7.3 Money, IDs, and import rules

- Package/payment logic uses integer paise: `₹1 = 100 paise`.
- The front end displays amounts but cannot set the authoritative package
  price; the server/database selects approved package pricing.
- Wedding/customer/order references are generated server-side; avoid
  predictable `MAX(id)+1` ID generation.
- The invitation import documentation describes random wedding UUIDs and
  high-entropy regenerated invite codes. Treat guest-code files as private
  because a code grants access to that guest invitation.
- Historical spreadsheet values should be reviewed before importing. Do not
  treat a spreadsheet's claimed payment or calculated balance as verified
  financial truth.
- Customer data, guest phone numbers, invitation codes, payment proof, private
  dashboard links, and service-role credentials must not be placed in public
  web folders or public logs.

## 8. Database function responsibilities

The core invitation SQL defines browser-facing RPCs such as:

- `lookup_invitation(p_invite_code)`: find one guest and return the associated
  wedding card payload and event programme.
- `lookup_wedding(p_wedding_id)`: return the wedding preview payload for
  preview surfaces.
- `submit_invitation_rsvp(...)`: validate and create/update the RSVP using the
  invitation code.

The customer-onboarding migration defines server/admin-facing functions,
including:

- `get_onboarding_packages()`
- `provision_new_customer(...)`
- `get_customer_dashboard(...)`
- `add_dashboard_guests(...)`
- `update_dashboard_guest(...)`
- `delete_dashboard_guest(...)`
- `attach_onboarding_payment_proof(...)`
- `get_admin_payment_queue()`
- `verify_onboarding_payment(...)`
- `claim_notification_outbox(...)`
- `finish_notification_outbox(...)`

The cash quote migration defines:

- `submit_cash_quote_request(...)`
- `get_admin_cash_quote_requests()`
- `update_admin_cash_quote_request(...)`

These functions and their grants are security-sensitive. Apply only the
documented migration version after reviewing it against a backup/staging
database; do not manually expose all tables to browser roles as a shortcut.

## 9. Security, privacy, and abuse controls

### 9.1 Existing design controls in code

- Browser contains only the Supabase project URL and publishable/anon key.
- Service-role, Resend, Turnstile secret, rate-limit, and cron secrets are
  intended to remain server-side.
- Invitation and onboarding SQL migrations enable row-level security and
  restrict sensitive direct-table access.
- Public requests are checked against an exact CORS/origin allowlist.
- Standard order submission uses Cloudflare Turnstile server verification.
- Quote and paid order flows use idempotency keys to prevent duplicate
  submissions during a retry.
- Inputs and request-body sizes are bounded and validated in both browser and
  server/database layers.
- Cash quote requests are limited by a hashed IP fingerprint; migration logic
  allows at most five per fingerprint per hour.
- Customer dashboard uses a random bearer token and stores a hash for lookup;
  dashboard access is revocable/expiring.
- Payment proof images are limited to JPG/PNG/WebP and 3 MB and use a private
  storage bucket.
- Admin RPC access requires an authenticated allowlisted user.
- Payment decisions are recorded in an audit table.
- UI output generally uses text escaping/`textContent` for user-provided
  strings.

### 9.2 Required operational practices

- Use HTTPS for every public deployment and restrict Supabase Auth redirect
  URLs to the actual admin site.
- Use different, strong random secrets for rate limiting and scheduled worker
  authentication.
- Set least-privilege administrator accounts and review/remove access when
  staff change.
- Never paste real secrets into this document, tickets, source code, browser
  configuration, or screenshots.
- Do not log bearer dashboard tokens, full invite-code exports, payment proof,
  or unnecessary personal data.
- Back up data and define retention/deletion rules before accepting real
  customer data.
- Verify payment against actual bank/merchant records before recording funds
  as received. A UTR or screenshot is a claim, not verification.

### 9.3 Security validation still required

- Have a qualified reviewer assess all SQL `SECURITY DEFINER` functions,
  grants, RLS policies, storage access, auth redirect rules, and Edge Function
  error paths in the actual Supabase project.
- Confirm request-size/rate limits at the platform edge as well as application
  level.
- Confirm backup, restore, incident response, retention, privacy notice, and
  access-audit procedures.
- Do not claim a formal security audit has been completed.

## 10. Functional software requirements

The following requirements define the intended acceptance behavior.

### Invitation and RSVP

- **FR-01:** A valid `?code=` link shows the correct invitee and wedding card.
- **FR-02:** The wedding card displays wedding date, design/theme, and events
  returned for that wedding.
- **FR-03:** An invalid or missing code shows a clear fallback/error, not
  another guest's data.
- **FR-04:** RSVP accepts only `attending`, `declined`, or `tentative`.
- **FR-05:** Attending count cannot exceed the invitation's guest limit;
  the database is the final authority.
- **FR-06:** Successful RSVP submission gives visible confirmation and cannot
  accidentally be submitted twice from the same completed form.

### Onboarding/order

- **FR-07:** Customer fields are validated with clear field-specific errors.
- **FR-08:** A customer can review the wedding details and event programme
  before submission.
- **FR-09:** Packages are displayed only from active server/database
  configuration; unconfigured prices must not appear as approved offers.
- **FR-10:** UPI payment amount and package are calculated from trusted server
  configuration, not client-supplied price values.
- **FR-11:** Cash order submission does not require UPI UTR/proof.
- **FR-12:** A standard paid order requires valid Turnstile configuration and
  verification.
- **FR-13:** Provisioning is transactional and idempotent.
- **FR-14:** An offline-package cash quote is a distinct request and never
  claims to be a confirmed order/dashboard.
- **FR-15:** Submission displays request/order reference and explicit
  success/failure state.

### Customer dashboard and admin

- **FR-16:** Dashboard only loads with a valid, unexpired private bearer token.
- **FR-17:** Authorized customers can add, edit, and remove guest records for
  their own order only.
- **FR-18:** CSV import previews/validates records and reports duplicate or
  invalid rows before a successful import.
- **FR-19:** Guest links include each saved invite code and can be copied or
  shared by user-initiated WhatsApp.
- **FR-20:** RSVP summary shows invited, pending, attending, declined, and
  tentative counts.
- **FR-21:** Only active allowlisted admins can see private payment/quote
  queues.
- **FR-22:** Payment verify/reject actions require an explicit decision and
  preserve an audit record.
- **FR-23:** Quote statuses support New, Contacted, Converted, and Closed.
- **FR-24:** Email attempts are retryable and do not undo a successfully
  provisioned order.

## 11. Non-functional requirements

These are target requirements, not all verified capabilities.

| Area | Requirement / target | Current evidence |
| --- | --- | --- |
| Availability | Website and database available during customer invitation use | No production uptime/SLA evidence in repository |
| Performance | Support 1,000–2,000 concurrent users without unacceptable lag | Requested target; no load test or plan sizing evidence |
| Security | No customer/payment data exposed through broad public table access | Security mechanisms exist in code/migrations; live grants/RLS not verified |
| Data integrity | Order provisioning is atomic and repeated submissions are idempotent | Implemented as migration/RPC design; not live-tested |
| Accessibility | Keyboard-operable forms, labels, clear errors, responsive content | Some semantic/accessibility implementation present; no formal WCAG audit |
| Compatibility | Current desktop/mobile browsers with JavaScript modules and modern APIs | Needs explicit browser matrix and real-device QA |
| Recoverability | Database backups and restoration procedure | Must be configured/verified in Supabase project |
| Observability | Errors, email failures, admin actions, and performance are monitorable | Some server logs and database audit/outbox; no complete monitoring/alerting runbook |
| Privacy | Minimize and restrict personal data; provide retention/contact policy | Access boundaries designed; business policy/legal text still required |
| Localization | Invitation text supports English, Bengali, Hindi, Urdu | Translation tests exist; full localized onboarding/admin language is not claimed |
| Maintainability | Changes tested and documented; migrations are versioned | SQL migrations and Node tests exist; CI/release automation not identified |

### 11.1 Performance acceptance plan

Before claiming 1,000–2,000 concurrent-user support:

1. Define workload mix: invitation reads, RSVP writes, dashboard reads, guest
   imports, and onboarding submissions.
2. Define acceptable p95/p99 response times, error rate, and test duration.
3. Select the Supabase/database plan, connection/pooling settings, and static
   hosting/CDN plan.
4. Run staged load tests against a non-production environment with realistic
   data volumes and safe synthetic users.
5. Inspect Postgres query plans, indexes, Edge Function duration/concurrency,
   rate limits, and email queue behavior.
6. Record the test results and remediate bottlenecks before production claims.

## 12. Software, account, and environment requirements

### 12.1 Developer workstation

Observed in the inspected environment:

- Windows workstation.
- Node.js `v25.8.0`; npm `11.11.0`.
- `npm test` uses the built-in Node test runner and does not need a framework
  build step.
- Supabase CLI, Deno, and `psql` were not found on the inspected PATH.

Recommended supported project tooling:

- Use a currently supported Node.js LTS release for repeatable development and
  CI; record the chosen version in the project before formal release.
- Install Supabase CLI for local Edge Function serving, migrations, secrets,
  linking, and deployment.
- Install/use the Deno version supported by the Supabase CLI for local Edge
  Function type checking and execution.
- Use a PostgreSQL-compatible SQL validation/staging database for migration
  testing; a syntax-only scan is not a substitute for applying migrations.
- Use Git or another source-control system with protected branches and
  reviewable migration changes. The inspected project root was not a Git
  repository.
- Use a modern browser with ES modules, `fetch`, `URL`, `FormData`,
  `sessionStorage`, `crypto.randomUUID`, and CSS Grid.

### 12.2 Hosted services/accounts

Required for the described live product:

1. Supabase project with PostgreSQL, Auth, Edge Functions, and private Storage.
2. Static hosting for the entire site tree and HTTPS custom domain.
3. Cloudflare Turnstile widget for standard paid-order anti-bot checks.
4. Resend account and verified sender domain for transactional email.
5. Merchant UPI VPA/name and a business process for verifying settlement.
6. An existing Supabase Auth administrator account and allowlist entry.
7. Trusted scheduler to call `process-outbox` regularly with its secret.
8. Optional staging Supabase project and staging/static preview domain.

### 12.3 Configuration values

Browser-delivered configuration:

- Supabase project URL.
- Supabase publishable/anon key.
- Public Turnstile site key.

Server-only Edge Function secrets:

- Supabase service-role key (normally provided by Supabase at runtime).
- `APP_ALLOWED_ORIGINS`
- `APP_BASE_URL`
- `ADMIN_PANEL_URL`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `RESEND_API_KEY`
- `UPI_VPA`
- `UPI_MERCHANT_NAME`
- `TURNSTILE_SECRET_KEY`
- `RATE_LIMIT_SECRET`
- `OUTBOX_CRON_SECRET`

`.env.example` contains placeholders. It is a reference only; this static app
does not automatically load those variables. Set secrets through the trusted
Supabase secret-management interface/CLI, not into HTML or browser JavaScript.

## 13. Deployment and configuration runbook

Perform in a backup-backed staging project first. The project documentation
assumes the legacy/core invitation database has been set up before onboarding.

### Phase A — Prepare source and environment

1. Back up the target Supabase project and confirm which database already
   exists. Do not run sample-data scripts blindly against a production wedding.
2. Review the core table names/columns against
   [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
3. Confirm the front-end Supabase URL points to the intended staging project.
4. Keep guest/customer CSV exports and secrets outside the static website root.

### Phase B — Database

1. Apply [supabase-schema.sql](./supabase-schema.sql) to create/align the core
   invitation schema, only after checking it against existing production data.
2. Import approved CSVs in the order documented in
   [SUPABASE_SETUP.md](./SUPABASE_SETUP.md). The import bundle is intended to
   be private and is not present under the inspected `Invite/` project root.
3. Apply [supabase-final-fix.sql](./supabase-final-fix.sql) only if its
   sample wedding data is appropriate for the target.
4. If and only if the obsolete RSVP overload still exists, review and apply
   [supabase-rsvp-overload-fix.sql](./supabase-rsvp-overload-fix.sql).
5. Verify invitation lookup, programme return values, guest isolation, and
   RSVP upsert behavior in staging.
6. Apply
   [20261012230000_customer_onboarding.sql](./supabase/migrations/20261012230000_customer_onboarding.sql).
7. Apply
   [20261013210000_cash_quote_requests.sql](./supabase/migrations/20261013210000_cash_quote_requests.sql).
8. Verify migration completion, expected functions, grants, RLS, private
   storage bucket, and sample/seed state.

Do not run core/final-fix sample SQL or migrations directly against production
without a database backup and a schema/data review.

### Phase C — Business configuration

1. Set and approve actual package prices and features. Keep package inactive
   until its price and fulfillment are approved.
2. Configure actual merchant VPA and display name.
3. Create Turnstile site/secret keys for the intended hostnames.
4. Verify the Resend sender domain and choose a monitored admin inbox.
5. Set exact allowed production and local origins. Never set `*`.
6. Generate strong, unique rate-limit and outbox scheduler secrets.
7. Add the existing Supabase Auth administrator user UUID to
   `public.onboarding_admins`.
8. Restrict Supabase Auth redirect URLs to approved admin URLs.
9. Set the scheduled outbox worker to run on a trusted schedule (the guide
   suggests once per minute).

### Phase D — Deploy code

From the project root, an authorized operator needs the Supabase CLI linked to
the correct project and required secrets configured. Deploy:

```powershell
supabase functions deploy onboarding
supabase functions deploy customer-dashboard
supabase functions deploy verify-payment
supabase functions deploy process-outbox
```

Then deploy the complete static website tree, keeping `/onboard/`,
`/dashboard/`, and `/admin/` directories intact. Add static-host cache rules
that do not cache private API responses. Confirm HTTPS and custom-domain
redirects.

### Phase E — Smoke test

1. Open the deployed invitation with a known test code.
2. Confirm the expected couple, guest, programme, and RSVP limit.
3. Submit a test RSVP and confirm it appears only once.
4. Load onboarding configuration and confirm real package/theme/style data.
5. Submit one sandbox/test cash quote and confirm its reference in admin.
6. Submit a test paid order with test-only details and verify exactly one set
   of order records is provisioned.
7. Test UPI URI creation but do not infer payment success from QR display.
8. Verify/reject a test payment as admin and check its audit trail.
9. Open the private dashboard link, add/edit/delete a guest, import a small CSV,
   and confirm the guest's personal link works.
10. Confirm customer/admin email provider acceptance and eventual mailbox
    delivery; test outbox retry behavior.
11. Confirm expired/invalid customer tokens and non-admin accounts are denied.
12. Re-run the checks after deployment and archive the release evidence.

## 14. Testing and evidence

### 14.1 Current automated test command

From `Invite/`:

```powershell
npm test
```

At the time this document was prepared, this returned **37 passed, 0 failed**.
The tests cover:

- Invitation lookup payload and error behavior.
- RSVP RPC arguments and invitation capacity checks.
- Guest-link parsing and URL construction.
- Translation/localization helpers.
- Package money display and UPI URI generation.
- Onboarding validation and cash-request validation.
- CSV guest parsing and duplicate/invalid row checks.
- QR SVG generation.
- Rendering behavior for all ten templates and escaping of wedding content.

### 14.2 Not covered by that test result

- Applying either SQL migration to the actual Supabase schema.
- Deno type-check or Edge Function integration tests.
- Running Edge Functions locally or in the target project.
- Real CORS/preflight and origin allowlist behavior in production.
- Live email delivery, Resend retry, or email mailbox configuration.
- Admin magic-link authentication in the deployed Auth configuration.
- Actual UPI payment, payment verification, or bank settlement.
- Full end-to-end production customer workflow.
- Load, stress, recovery, browser accessibility, and security penetration
  testing.

## 15. Project file map

### Root website, API, and configuration

| File | Responsibility |
| --- | --- |
| `index.html` | Main personalized invitation and RSVP page |
| `api.js` | Supabase invitation/preview/RSVP client API |
| `supabase-config.js` | Browser-safe Supabase URL and publishable key |
| `onboarding-config.js` | Browser URLs/keys for onboarding Edge Functions and public Turnstile site key |
| `onboarding-core.js` | Shared validations, event defaults, package money, UPI URI, and CSV parsing |
| `i18n.js` | Invitation text/date localization |
| `share.html` | Invitation preview/share page |
| `studio.html` | Invitation design preview/studio |
| `guest-list.html` | Guest link and QR utility page |
| `guest-links.js` | Guest link parsing/URL helper |
| `invitation.mp3` | Invitation audio asset |
| `supabase-config.js` | Public project connection values; no secret key belongs here |

### Onboarding, customer and admin pages

| File | Responsibility |
| --- | --- |
| `onboard/index.html` | Customer onboarding form markup |
| `onboard/app.js` | Onboarding steps, validation, submission, and success/error UI |
| `onboard/style.css` | Onboarding visual layout |
| `dashboard/index.html` | Customer dashboard markup |
| `dashboard/app.js` | Dashboard data, guest CRUD, CSV, link sharing, RSVP/timeline display |
| `dashboard/style.css` | Dashboard styles and shared admin styles |
| `admin/index.html` | Administrator login/review markup |
| `admin/app.js` | Admin auth flow, payment queue, cash quote follow-up |

### Invitation designs and QR library

| Files | Responsibility |
| --- | --- |
| `templates/template-01.js` through `templates/template-10.js` | Ten renderable invitation designs |
| `vendor/qrcode-generator.js` | Locally bundled QR-code implementation |
| `vendor/qrcode-generator.LICENSE.txt` | License text for the bundled QR implementation |

### SQL, server functions, and documentation

| File | Responsibility |
| --- | --- |
| `supabase-schema.sql` | Core invitation schema and public card/RSVP database functions |
| `supabase-final-fix.sql` | Sample wedding/programme synchronization and RPC compatibility fix; review sample values before use |
| `supabase-rsvp-overload-fix.sql` | Removes the known legacy RSVP function overload when needed |
| `supabase/migrations/20261012230000_customer_onboarding.sql` | Main additive order, payment, dashboard, access, admin and outbox schema/RPC migration |
| `supabase/migrations/20261013210000_cash_quote_requests.sql` | Private quote-request table and admin RPCs |
| `supabase/config.toml` | Supabase Edge Function JWT settings |
| `supabase/functions/_shared/http.ts` | Shared CORS, origin, response, token and server-config helpers |
| `supabase/functions/onboarding/index.ts` | Packages, order provisioning, cash quote submission |
| `supabase/functions/customer-dashboard/index.ts` | Bearer-token dashboard and guest operations |
| `supabase/functions/verify-payment/index.ts` | Admin payment queue/review and quote-request status endpoint |
| `supabase/functions/process-outbox/index.ts` | Resend transactional email delivery/retries |
| `SUPABASE_SETUP.md` | Core schema, CSV import, invitation, and RSVP setup guide |
| `ONBOARDING_SETUP.md` | Onboarding migration/configuration/deployment and operational caveats |
| `.env.example` | Placeholder configuration names; not loaded automatically by static code |
| `.gitignore` | Excludes local secret environment files |
| `package.json` | Project metadata and `npm test` command |
| `package-lock.json` | npm dependency lockfile |

### Tests

| File | Coverage |
| --- | --- |
| `tests/api.test.js` | Invitation API and RSVP behavior |
| `tests/guest-links.test.js` | Guest link validation/creation |
| `tests/i18n.test.js` | Translation and locale behavior |
| `tests/onboarding-core.test.js` | Onboarding rules, packages, UPI, cash quote and CSV parsing |
| `tests/qr.test.js` | QR generation |
| `tests/templates.test.js` | Renderability and HTML escaping for ten templates |

## 16. Delivery history and actions completed

The following is a concise record of the material project work reflected by
the repository and prior project notes; it is not a claim that each step was
deployed to a live service.

1. **Migration away from spreadsheet runtime logic:** invitation lookup and
   RSVP work was moved to Supabase RPC-backed requests. Excel/CSV is retained
   for offline preparation/import rather than live website reads/writes.
2. **Invitation database and data import design:** added wedding details,
   event timeline, themes, styles, RSVP contacts, guest, customer, and RSVP
   structures, plus import documentation. Historical notes describe a private
   external CSV bundle; the bundle was not present under the inspected
   `Invite/` root at document time.
3. **Wedding programme repair:** identified that event rows were not being
   returned through the old API payload; added event support to the data
   contract and card payload.
4. **Invitation/RSVP refinements:** added RPC-based RSVP submission, status
   validation, guest-limit enforcement, duplicate submission prevention,
   localization, and guest-link helpers.
5. **RSVP ambiguity fix:** recorded a targeted SQL fix for the two
   `submit_invitation_rsvp` overloads that caused PostgREST `PGRST203`.
6. **Customer onboarding architecture:** added SQL, page, and server-function
   code for package selection, order provisioning, UPI/cash payment tracking,
   dashboard access, email outbox, and administrator payment review.
7. **Onboarding UI corrections:** improved validation and empty event
   timeline handling, package-configuration failure display, Turnstile
   behavior, and UPI configuration checks.
8. **Admin email guidance:** documented how an existing administrator account
   is allowlisted and how admin email/configuration is intended to work.
9. **Dashboard/guest link work:** added the customer dashboard design for
   order details, guest management, CSV imports, personal links, RSVP summary,
   and programme display.
10. **Cash fallback:** added a distinct manual quote request path, private
    storage/RPCs, rate limiting and idempotency, admin queue/status controls,
    frontend validation, and tests.
11. **HTTP 404 diagnosis:** observed/reported that the configured Supabase
    project did not find the `onboarding` function. Added a specific user-facing
    404 explanation and documented CLI deployment steps. The function has not
    been deployed/verified remotely in the inspected work.
12. **Current automated check:** 37 Node tests passed in this workstation.
    This validates local pure logic/rendering tests only, not a live service.

## 17. Remaining work, prioritized

### P0 — Required to accept real quote requests or orders

1. Confirm the exact Supabase project URL and project reference used by the
   deployed static site.
2. Install/use the Supabase CLI and deploy `onboarding` to that exact project;
   the user's observed 404 must be retested and cleared.
3. Apply both onboarding migrations in the correct database after verifying
   core prerequisites and taking a backup.
4. Set `RATE_LIMIT_SECRET` and exact `APP_ALLOWED_ORIGINS`; verify preflight
   and POST from the actual site origin.
5. Confirm the quote-request table/RPC exists and test a quote end to end; then
   confirm it appears in the allowlisted `/admin/` queue.
6. For standard paid orders, configure real active packages/prices, Turnstile,
   merchant VPA, and server-side secrets. Do not enable a paid offer until
   business approves the price and process.
7. Deploy all four Edge Functions and validate in staging before production.
8. Validate SQL syntax, migration behavior, function signatures, grants, RLS,
   storage bucket rules, idempotency, and concurrency against a staging copy
   of the actual database schema.

### P1 — Required before routine customer operations

1. Verify administrator magic link, Auth redirect URLs, allowlist, payment
   proof viewing, verify/reject actions, and audit rows.
2. Verify Resend sender/domain and real customer/admin email delivery.
3. Configure and test trusted scheduled `process-outbox` retries and alerting.
4. Test dashboard token creation, email link, expiry, revocation, guest
   mutations, CSV import, and RSVP updates end to end.
5. Add an operational procedure for cash quote review; no automatic cash quote
   email is currently sent.
6. Review privacy notice, consent, data retention, customer support channel,
   payment disclaimers, and incident contacts.

### P2 — Quality, scale, and operational maturity

1. Run accessibility checks and manual keyboard/screen-reader review.
2. Test on current mobile and desktop browsers and low-bandwidth connections.
3. Run workload-based load tests for the requested 1,000–2,000 concurrency
   target; tune Supabase plan, indexes, Edge Functions, static CDN, and
   connection patterns from measured results.
4. Add CI for Node tests, formatting/linting, Deno type-checks, and migration
   checks.
5. Add monitoring/alerts for Edge Function errors, rate limits, email queue
   age, failed deliveries, payment queue age, and database capacity.
6. Decide backup retention, recovery-time/recovery-point objectives, restore
   drills, and data deletion policy.
7. Decide if XLSX upload, automated WhatsApp, customer quote emails, or formal
   payment-provider integration are future requirements; they are not current
   scope.

## 18. Risks and decisions requiring business ownership

| Risk / decision | Why it matters | Owner action |
| --- | --- | --- |
| Onboarding function returns 404 | Quote/order requests cannot reach server | Deploy function to the project configured in the live site |
| Schema may differ from migration assumptions | Migration may fail or alter wrong schema | Compare actual schema; run in restored staging copy first |
| Package prices are placeholders/inactive | Customers cannot place normal paid orders | Business approves package price, advance, features, refund/cancellation policy |
| Cash quote requests have no automatic alert | Admin may not notice new leads | Assign queue monitoring or add notification behavior after approval |
| UPI QR is not payment collection | QR display can be mistaken for successful payment | Explain status and require independent payment verification |
| No load-test evidence | Concurrency target is unproven | Agree measurable SLOs and execute staged load test |
| Customer data/privacy policy absent from code evidence | Personal and financial data require governance | Approve consent, retention, deletion, and support policy |
| CSV files are sensitive | Invitation code/phone/customer data could be exposed | Keep import bundle outside public host and control distribution |
| Dashboard links are bearer credentials | Anyone holding a live link may gain customer access | Prevent logging/sharing, support revocation, handle forwarded email safely |
| Existing admin allowlist controls payment approval | Misconfigured accounts can block or expose operations | Verify least-privilege allowlist and account lifecycle |
| No complete production monitoring/runbook | Failures may go unnoticed | Configure alerts, ownership, support hours, and recovery procedure |

## 19. Production readiness checklist

Do not mark the service production-ready until each required item is evidenced:

- [ ] Correct Supabase project confirmed; browser config contains only its URL
  and public publishable key.
- [ ] Core schema and approved data imports are backed up and validated.
- [ ] Both onboarding migrations applied successfully in staging and production.
- [ ] RLS, grants, `SECURITY DEFINER` functions, and private storage reviewed.
- [ ] All four Edge Functions deployed at the intended project and smoke-tested.
- [ ] Onboarding HTTP 404 resolved; CORS tested from production origin.
- [ ] Quote request accepted once, idempotent on retry, and visible to admin.
- [ ] Paid packages/prices approved and active; no placeholder price is shown.
- [ ] Turnstile site/secret pair is correct for production domain.
- [ ] UPI merchant details are verified; manual payment verification process
  is documented.
- [ ] Resend sender/domain verified; customer/admin delivery and retry tested.
- [ ] Admin Auth redirect, allowlist, and payment audit behavior verified.
- [ ] Dashboard link is private, expiring, revocable, and works end to end.
- [ ] Guest CRUD, CSV import, invitation links, and RSVP monitoring tested.
- [ ] Privacy, consent, data retention, support, and incident-response policies
  are approved.
- [ ] Automated CI and backup/restore process are established.
- [ ] Accessibility, mobile browser, security, and load tests completed.
- [ ] Measured capacity supports the agreed concurrency/SLO target.

## 20. References in this repository

- Core database and import: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Customer onboarding deployment: [ONBOARDING_SETUP.md](./ONBOARDING_SETUP.md)
- Core SQL schema: [supabase-schema.sql](./supabase-schema.sql)
- Sample data/RPC finalization: [supabase-final-fix.sql](./supabase-final-fix.sql)
- RSVP overload fix: [supabase-rsvp-overload-fix.sql](./supabase-rsvp-overload-fix.sql)
- Main onboarding migration:
  [20261012230000_customer_onboarding.sql](./supabase/migrations/20261012230000_customer_onboarding.sql)
- Cash quote migration:
  [20261013210000_cash_quote_requests.sql](./supabase/migrations/20261013210000_cash_quote_requests.sql)
- Example config: [.env.example](./.env.example)

---

**Bottom line:** The repository contains a substantial working implementation
and the local Node suite passes. The product still needs the correct Supabase
schema/migrations, server secrets, Edge Function deployment, origin/CORS setup,
email/admin configuration, end-to-end staging verification, and a measured
load test. Until the reported 404 is fixed and the production checklist is
completed, treat onboarding as not live and do not promise 1,000–2,000-user
capacity.
