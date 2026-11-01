# Supabase database and data import

The invitation site uses Supabase RPCs for invitation lookup and RSVP saving.
It does not use Google Sheets, Excel at runtime, or Apps Script. Excel/CSV files
are only used once to seed the database.

## Database tables

Run [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase SQL Editor.
It creates these tables and the secure browser-facing RPCs:

| Table | Purpose | Important columns |
| --- | --- | --- |
| `weddings` | One invitation/card per wedding | `id`, `source_id`, `couple_name`, `bride_name`, `groom_name`, `event_date`, `template_style`, `theme_name`, `theme_color` |
| `wedding_details` | Card copy, venue, family names, media, and share settings | `wedding_id`, `status`, `host_name`, `host_address`, `bride_full`, `groom_full`, `bride_parents`, `groom_parents`, `ceremony_title`, `invocation`, `message`, `ceremony_time`, `venue_title`, `venue`, `address`, `map_url`, `compliments`, `footer_text`, `frame_image`, `image1`–`image5`, `slug`, `share_message`, `music_url` |
| `guests` | One invitation code and guest/family allowance per invitee | `id`, `wedding_id`, `invite_code`, `guest_name`, `family_members`, `phone`, `category`, `city_address`, `with_family`, `rsvp_status_manual`, `invite_sent`, `created_at` |
| `events` | Programme items displayed on the card | `id`, `wedding_id`, `sort_order`, `event_name`, `event_date`, `event_time`, `note` |
| `rsvp_contacts` | Card contact names and phone numbers | `id`, `wedding_id`, `sort_order`, `contact_name`, `phone`, `is_primary` |
| `themes` | Named color palettes | `theme_name`, `primary_color`, `primary_dark_color`, `accent_color`, `paper_top_color`, `paper_bottom_color`, `text_color`, `note` |
| `styles` | Template/style catalogue | `template_id`, `style_name`, `css_class`, `look`, `best_for` |
| `customers` | Private customer/order and payment records | `customer_id`, `wedding_id`, `customer_name`, `phone`, `city`, `package`, `list_price_inr`, `discount_inr`, `advance_paid_inr`, `order_status`, `order_date`, `delivery_due`, `notes`, `created_at` |
| `rsvps` | Latest response per invitation, created by the website | `id`, `wedding_id`, `invite_code`, `status`, `attending_count`, `wishes_message`, `submitted_at`, `updated_at` |

`id` and `wedding_id` are text identifiers in this schema. The supplied import
bundle uses random UUID-format wedding IDs instead of the spreadsheet's
sequential IDs; the original key is preserved as `source_id`. This prevents
the public preview RPC from exposing other cards through easily guessed IDs.
Guest invitation codes are also regenerated with 144 bits of randomness.
Treat `guests.csv` and the generated codes as secrets: possession of a code
opens that guest's invitation and permits an RSVP.

## Import-ready data

The [`supabase-import/`](../supabase-import/) folder contains the following
CSV files made from the supplied workbook archive. It is intentionally outside
the static site's `Invite` folder: several files contain personal or financial
information and must never be deployed with the website.

| CSV file | Rows | Columns |
| --- | ---: | --- |
| [`themes.csv`](../supabase-import/themes.csv) | 8 | `theme_name`, `primary_color`, `primary_dark_color`, `accent_color`, `paper_top_color`, `paper_bottom_color`, `text_color`, `note` |
| [`styles.csv`](../supabase-import/styles.csv) | 2 | `template_id`, `style_name`, `css_class`, `look`, `best_for` |
| [`weddings.csv`](../supabase-import/weddings.csv) | 1 | `id`, `source_id`, `couple_name`, `bride_name`, `groom_name`, `event_date`, `template_style`, `theme_name`, `theme_color` |
| [`wedding_details.csv`](../supabase-import/wedding_details.csv) | 1 | `wedding_id`, `status`, `host_name`, `host_address`, `bride_full`, `groom_full`, `bride_parents`, `groom_parents`, `ceremony_title`, `invocation`, `message`, `ceremony_time`, `venue_title`, `venue`, `address`, `map_url`, `compliments`, `footer_text`, `frame_image`, `image1`–`image5`, `slug`, `share_message`, `music_url` |
| [`guests.csv`](../supabase-import/guests.csv) | 2 | `wedding_id`, `invite_code`, `guest_name`, `family_members`, `phone`, `category`, `city_address`, `with_family`, `rsvp_status_manual`, `invite_sent` |
| [`events.csv`](../supabase-import/events.csv) | 5 | `wedding_id`, `sort_order`, `event_name`, `event_date`, `event_time`, `note` |
| [`rsvp_contacts.csv`](../supabase-import/rsvp_contacts.csv) | 3 | `wedding_id`, `sort_order`, `contact_name`, `phone`, `is_primary` |
| [`customers.csv`](../supabase-import/customers.csv) | 1 | `customer_id`, `wedding_id`, `customer_name`, `phone`, `city`, `package`, `list_price_inr`, `discount_inr`, `advance_paid_inr`, `order_status`, `order_date`, `delivery_due`, `notes` |

The RSVP table is intentionally empty initially; do not import a historical
sheet as current responses unless those rows have been reviewed and mapped to
the new invitation codes.

### Import steps

1. Back up the project. For the provided bundle, use an empty database or a
   clean import target. The schema script is safe to run more than once for
   supported additions, but importing these rows into already-populated tables
   can create duplicate-key errors or leave stale records.
2. Run `supabase-schema.sql` in the SQL Editor.
3. In **Table Editor → Import data from CSV**, import in this order:
   `themes.csv`, `styles.csv`, `weddings.csv`, `wedding_details.csv`,
   `guests.csv`, `events.csv`, `rsvp_contacts.csv`, `customers.csv` from
   `../supabase-import/`.
   Select the matching table for each file and keep the CSV header row as
   column names. Do not import `id`/timestamp columns that are absent from a
   file; the database generates their defaults.
4. Keep `guests.csv` private. Build each invite URL with the exact generated
   code in its `invite_code` column, for example
   `https://your-site.example/?code=<invite_code>`. The generated codes replace
   the lower-entropy codes from the workbook.
5. Keep `customers.csv` private. It contains customer and payment information
   and is not available to the public browser role.
6. After the CSV imports finish, run [`supabase-final-fix.sql`](./supabase-final-fix.sql)
   once in the SQL Editor. It upserts the canonical UUID wedding record, syncs
   venue/card details and the five programme events, and installs the
   frontend-compatible lookup/RSVP RPCs and restricted browser permissions.
   Do not run the earlier SQL snippet that creates a second `W-0001` wedding.
7. If the RSVP RPC reports an ambiguous function / `PGRST203` error because
   an older function overload already exists, run
   [`supabase-rsvp-overload-fix.sql`](./supabase-rsvp-overload-fix.sql) in the
   SQL Editor. It removes only the old `(integer, text, text, text)` overload
   and reloads PostgREST's schema cache. Do not drop
   `submit_invitation_rsvp(text, text, integer, text)`: that is the function
   used by the website.

## Runtime and access

The public page reads the `code` query parameter and calls `lookup_invitation`.
That RPC returns only the matching guest's card payload, including the wedding
programme from `events`. Opening the page without a code displays the
personalized-link fallback. `lookup_wedding` is used by the preview/share
surfaces and requires the random wedding ID from `weddings.csv`.

RSVPs are submitted through `submit_invitation_rsvp`; the database looks up
the wedding and guest limit from the invite code, validates the response, and
inserts or updates the one RSVP for that invitation. A successful submission
disables the form to avoid accidental resubmission. Direct table access is
revoked from browser roles. Guest phone numbers and customer/payment records
are not returned by the public RPCs; RSVP contact numbers are returned because
they are intentionally displayed on invitation cards.

The Supabase **publishable** key is configured as `SUPABASE_CONFIG.anonKey` in
[`supabase-config.js`](./supabase-config.js). A publishable/anon key may be
used in browser code. Never put a `service_role` key or secret key in this
repository.

Run `npm test` and deploy the static site after import. Supabase's compute,
rate, and request limits depend on the selected project plan; front-end code
alone cannot guarantee 1,000–2,000 concurrent visitors. Validate the target
project with a load test before the event.

## Customer onboarding and payment review

The customer self-service intake, secure dashboard, administrator payment
review, database migration, and Edge Function deployment steps are documented
in [`ONBOARDING_SETUP.md`](./ONBOARDING_SETUP.md). Apply the onboarding migration
only after the base schema, wedding data, and existing lookup/RSVP setup above
are in place. Configure package prices, secrets, an admin allowlist, and the
notification worker before enabling public order submissions.
