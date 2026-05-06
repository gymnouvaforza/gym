# Core Test Audit

Focused audit for `web + admin + api` core surfaces. Status labels:

- `unit-covered`: strong Vitest coverage around local behavior
- `e2e-covered`: live Playwright flow exists
- `partial`: some coverage exists, but key branch or contract still thin
- `missing`: no meaningful automated coverage found for current core expectations

## Public Web

| Flow | Status | Notes |
| --- | --- | --- |
| Home rendering | `e2e-covered` | `tests/e2e/public-home.spec.ts` covers basic public landing load. |
| Marketing route reachability | `e2e-covered` | `tests/e2e/public-marketing-routes.spec.ts` checks core public routes. |
| Marketing UI blocks | `unit-covered` | Marketing component tests exist for header, testimonials, schedule, product cards, cookie consent, WhatsApp CTA. |
| Contact / lead intake happy path | `partial` | Contact validators and leads export logic covered, but no dedicated public contact-form browser flow yet. |
| Legal / static route content | `partial` | Route reachability exists, but content contracts thin. |

## Auth

| Flow | Status | Notes |
| --- | --- | --- |
| Dashboard login UI | `e2e-covered` | `tests/e2e/dashboard-login.spec.ts`. |
| Firebase session route | `unit-covered` | `src/app/api/auth/session/route.test.ts` plus security/header tests. |
| Welcome / auth API helpers | `unit-covered` | Auth route tests exist. |
| Password reset / update forms | `unit-covered` | Auth component tests exist. |
| Full auth recovery browser flow | `missing` | No live E2E for reset/update/verify path. |

## Dashboard

| Flow | Status | Notes |
| --- | --- | --- |
| Dashboard login gate | `e2e-covered` | Covered through login smoke. |
| Leads dashboard interactions | `e2e-covered` | Search, filters, detail dialog covered in `tests/e2e/dashboard-leads.spec.ts`. |
| Marketing dashboard render | `e2e-covered` | `tests/e2e/dashboard-marketing.spec.ts`. |
| Members dashboard summary + export wiring | `unit-covered` | Covered by new `src/app/(admin)/dashboard/miembros/page.test.tsx`. |
| Members detail tabs | `unit-covered` | Existing member detail page/tab tests. |
| Members list query filters | `unit-covered` | Covered by new `src/lib/data/gym-management.members-list.test.ts`. |
| Members list live browser flow | `e2e-covered` | Covered by new `tests/e2e/dashboard-members.spec.ts`. |
| Dashboard store/admin store flows | `partial` | Many unit/integration tests exist, but no broad browser smoke for store admin CRUD. |

## Next API

| Flow | Status | Notes |
| --- | --- | --- |
| Auth session APIs | `unit-covered` | Good branch coverage around cookie/session behavior. |
| Leads export API | `partial` | Basic route test exists, contract assertions still lighter than member export. |
| Members export API | `unit-covered` | New route test covers auth, env, filter, CSV and DB-error branches. |
| Member account APIs | `unit-covered` | Multiple route tests exist. |
| Mobile staff/member APIs | `unit-covered` | Many route tests exist, outside this audit scope for live browser coverage. |
| Service outage / external dependency degradation | `partial` | Some env/error branches exist; still uneven across dashboard APIs. |

## Ranked Next Waves

1. `members`
   - Add browser assertions for archive flow and filter persistence.
   - Add route contract test for empty result CSV and filename date stability via fake timers.
2. `auth/session`
   - Add E2E for password reset/update path.
   - Strengthen CSRF / role boundary cases around dashboard auth helpers.
3. `contact/leads`
   - Add public contact form browser flow with success + validation error states.
   - Expand leads export route contract assertions to match member export depth.
4. `member-account`
   - Add live smoke for profile update / password / testimonial flows behind auth.
   - Add degraded-service error-state checks.
5. `store/pickup`
   - Add browser smoke for pickup checkout and dashboard pickup operations.
   - Tighten API failure-mode coverage around Medusa and bridge persistence.
