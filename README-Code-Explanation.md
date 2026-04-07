# Code Explanation

This file provides a brief explanation of each page in the current app, including code mapping and functionality.

## Page Overview

- Page configuration file: `src/pages.json`
- Number of currently configured pages: 1

## 1) Home Page (Login/Register Page)

- Route path: `pages/index/index`
- Code file: `src/pages/index/index.vue`
- Purpose:
  - Serves as the app launch page and supports both login and register modes.
  - Provides email input, password input, and confirm password input (shown in register mode).
  - Includes password visibility toggle, basic form validation, submit loading state, and result feedback.
  - Includes a "Forgot Password" prompt and visual placeholders for third-party login buttons.

## Code Structure Mapping (`index.vue`)

- `template`:
  - Defines page structure and UI layout (background, card, login/register switch, input fields, buttons, and social login area).
- `script`:
  - Manages state (`mode`, `form`, `loading`, `showPassword`, etc.).
  - Handles interactions (mode switching, email validation, submit flow, forgot password feedback).
- `style`:
  - Defines visual styling and animations (gradient background, card style, switch animation, input focus feedback, and button press feedback).

## Additional Notes

- `mobile-login-prototype.html` is a standalone prototype demo file and is not part of the app route pages defined in `pages.json`.
- If new pages are added later, register their routes in `src/pages.json` and document them in this README using the same format.

