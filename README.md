# FootballFanStore

A static front-end storefront for football jerseys, built with plain HTML, CSS, and JavaScript.

## Overview

This project includes:
- A fixed header with announcement bar and responsive mobile navigation
- Theme toggle (light/dark) with localStorage persistence
- Product sections for World Cup 2026, club jerseys, and retro kits
- Add-to-cart visual animation (cleat kick + ball arc to cart)
- Cart counter pulse and temporary success message
- Login/signup modal UI with demo auth state
- Newsletter form and product reveal-on-scroll animations

## Tech Stack

- HTML5
- CSS3 (custom properties, media queries, animations)
- Vanilla JavaScript (DOM APIs, IntersectionObserver, localStorage)

## Project Structure

```text
footballfanstore/
|- index.html
|- style.css
|- script.js
|- README.md
`- images/
   |- logo.png
   |- ChOb/
   |  |- ball_ffs1.png
   |  |- Budget round.png
   |  |- cart_ffs1.png
   |  |- cart_toggle_ffs.png
   |  |- cleat_ffs1.png
   |  |- International round.png
   |  |- NeymarFH.png
   |  |- Others round.png
   |  |- Premium Round.png
   |  |- Retro round.png
   |  `- Team Set round.png
   `- products/
      |- club-1.jpg ... club-8.jpg
      |- retro-1.jpg ... retro-8.jpg
      `- wc2026-1.jpg ... wc2026-8.jpg
```

## How to Run

No build tools are required.

1. Open the project folder in VS Code.
2. Open index.html in a browser.

Optional (recommended in VS Code):
- Use a local server extension (for example, Live Server) and serve index.html.

## Main Files

- index.html: Page structure, product cards, footer, and login modal markup.
- style.css: Full visual system, responsive layout, animations, and theme styles.
- script.js: Interactions including nav behavior, theme toggle, cart animation, modal logic, and scroll effects.

## Key Behavior Notes

- Theme is stored under localStorage key: ffs-theme.
- Animated cart assets use:
  - images/ChOb/cleat_ffs1.png
  - images/ChOb/ball_ffs1.png
  - images/ChOb/cart_ffs1.png
  - images/ChOb/cart_toggle_ffs.png
- script.js sets a default asset base path:
  - window.ASSET_BASE_PATH = 'images/ChOb/'

You can override this by setting window.ASSET_BASE_PATH before script.js loads.

## Current Demo/Placeholder Logic

These parts are intentionally demo-style right now:
- Search button uses a prompt and alert.
- Quick View uses an alert.
- Newsletter submit uses an alert.
- Login/signup state is front-end only (no backend or real authentication).

## Customization

- Update product content in index.html.
- Adjust theme colors in :root variables in style.css.
- Replace or add assets in images/ and update paths as needed.
- Replace alert-based placeholders in script.js with real UI/components.

## Future Improvements

- Add a real product data layer (JSON or API)
- Persist cart items in localStorage
- Implement real authentication and account pages
- Add product detail modal/page for Quick View
- Add filtering, sorting, and search results UI
- Add accessibility pass (keyboard navigation and ARIA refinements)
