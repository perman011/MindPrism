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
