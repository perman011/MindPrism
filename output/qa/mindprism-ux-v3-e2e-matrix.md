# QA E2E Matrix V3

| ID | Flow | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| E2E-01 | Dashboard brand lockup | Logged-in user | Open dashboard in light mode | Transparent icon + lowercase `mindprism` visible | P0 |
| E2E-02 | Brand dark mode contrast | Logged-in user | Switch to dark mode | Logo + wordmark readable with sufficient contrast | P0 |
| E2E-03 | Short image upload+publish+render | Admin + sample short | Upload image short, publish, open dashboard quick bites | Card thumbnail renders without broken icon | P0 |
| E2E-04 | Short video upload+publish+render | Admin + sample short | Upload video + thumbnail, publish, open short player | Video or poster renders; no broken media state | P0 |
| E2E-05 | Short audio upload+publish+render | Admin + sample short | Upload audio + thumbnail, publish, open short player | Audio control mounts; thumbnail fallback visible | P0 |
| E2E-06 | Invalid thumbnail URL fallback | Existing short with bad URL | Open quick bites | Gradient fallback card shown | P0 |
| E2E-07 | Invalid book cover fallback | Book with bad cover URL | Open Jump Back In / book rails | Fallback cover tile shown | P0 |
| E2E-08 | Byte-range media seek | Published video/audio short | Play media and seek forward/back | Seek succeeds without reload failure | P0 |
| E2E-09 | Onboarding step persistence | New user | Complete step 1-2, refresh | Step + selections are preserved | P1 |
| E2E-10 | Onboarding completion | New user | Complete 3 steps and submit | Redirect to dashboard, state cleared | P1 |
| E2E-11 | Admin publish validation | Admin | Try publish video short without thumbnail | API rejects with clear validation error | P1 |
| E2E-12 | Upload format validation | Admin | Upload unsupported image format | Client/server reject with actionable error | P1 |
| E2E-13 | Billing checkout entitlement grant | Free user + Stripe test mode | Start checkout, complete payment, return to app | User plan switches to Premium and entitlement persists after refresh | P0 |
| E2E-14 | Billing cancellation entitlement revoke | Premium user + Stripe portal access | Cancel active subscription in portal, process webhook | User is downgraded to Free at expected state boundary | P0 |
| E2E-15 | Billing failed payment handling | Premium user + forced payment failure | Trigger invoice payment failure in Stripe test mode | Entitlement is revoked and user sees Free plan state | P0 |
| E2E-16 | Billing webhook replay idempotency | Existing Stripe event id | Replay same webhook event id | No duplicate side effects; handler returns duplicate-safe response | P0 |
| E2E-17 | Chapter audio unavailable fallback | Published chapter with missing audio object | Open chapter reader and attempt playback | Reader shows error copy instead of silent failure or blank control | P0 |
| E2E-18 | Audio seek stability | Published audio media | Play and seek forward/back multiple times | Playback resumes without stalls or reload crashes | P0 |
| E2E-19 | Restricted admin deep-link (users) | Writer account | Open `/admin/users` directly | Access denied view shown; no privileged data rendered | P0 |
| E2E-20 | Restricted admin deep-link (analytics) | Writer account | Open `/admin/analytics` directly | Access denied view shown; no privileged data rendered | P0 |
| E2E-21 | Admin API RBAC forbidden matrix | Authenticated role below requirement | Call restricted admin API endpoints | API returns `403` with consistent message | P0 |
| E2E-22 | Unauthenticated admin API matrix | No session cookie | Call admin endpoints | API returns `401` with consistent message | P0 |
