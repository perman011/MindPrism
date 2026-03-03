# Defect Severity Model

- Sev-0: System unusable or data-loss/security incident. Immediate rollback/hotfix.
- Sev-1: Core flow blocked for many users. Fix before release.
- Sev-2: Major issue with workaround. Release only with explicit risk acceptance.
- Sev-3: Minor issue or cosmetic bug. Backlog allowed.

Each defect record should include:
- reproducible steps
- expected vs actual
- environment/build
- logs/screenshots
- owner and ETA
