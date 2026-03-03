# Dark Purple Design System (Default)

## Core Tokens

- `--bg-900: #0E0816`
- `--bg-800: #1A1028`
- `--surface-700: #241536`
- `--surface-600: #2C1A45`
- `--primary-500: #7C3AED`
- `--primary-400: #8B5CF6`
- `--accent-400: #C4B5FD`
- `--text-100: #F5F3FF`
- `--text-300: #DDD6FE`
- `--success-400: #34D399`
- `--warning-400: #FBBF24`
- `--danger-400: #FB7185`

## UI Rules

- Keep contrast high: body text must meet WCAG AA at minimum.
- Use one primary CTA color (`--primary-500`); avoid multicolor CTA noise.
- Use soft glows and low-noise gradients, not heavy neon blur.
- Reserve accent color for data highlights and active states.

## Typography Guidance

- Pair one display face + one readable UI face.
- Limit to 4-5 type sizes on core screens.
- Keep line length 55-75 characters for dense content areas.

## Motion Guidance

- Add only purposeful transitions:
  - page transition: 180-240ms
  - panel enter/exit: 140-180ms
  - list stagger: 30-50ms offset
