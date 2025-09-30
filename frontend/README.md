# ShopLyft Frontend

A modern, minimal web app for ShopLyft, built with **React 19**, **TypeScript**, **TailwindCSS v4.1**, and **Framer Motion**. The UI features smooth, non-distracting animations, a custom color system, and clear user flows for optimal shopping plan generation.

---

## Tech Stack

- React 19 (functional components, hooks)
- TypeScript (strict types)
- TailwindCSS v4.1 (utility-first, responsive, custom color schema)
- Vite (build tool)
- Framer Motion (animated transitions, interactive UI)

---

## Setup Instructions

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run development server:**
   ```sh
   npm run dev
   ```
3. **Build for production:**
   ```sh
   npm run build
   ```
4. **Preview production build:**
   ```sh
   npm run preview
   ```

---

## Project Structure

- `public/` — Static files (e.g., favicon)
- `src/` — Source code
  - `main.tsx` — Entry point
  - `App.tsx` — Main app logic, animated transitions
  - `LandingPage.tsx` — Animated hero section
  - `index.css` — Tailwind import
- `tailwind.config.js` — TailwindCSS config (custom color schema)
- `vite.config.ts` — Vite config with Tailwind plugin

---

## Design Guidelines

- Minimal, modern design: whitespace, clear hierarchy, readable fonts
- Custom color system: primary, secondary, neutral, orange scale (Tailwind config)
- Animations: Framer Motion for page transitions, button hovers, savings counter
- Accessibility: Keyboard navigation, ARIA labels, color contrast
- Responsiveness: Mobile-first, adaptive layouts
- Tooltips: For disabled actions (e.g., min spend not met)
- Error Handling: Friendly fallback UI, warnings per spec

---

## API Integration

- **Base URL**: `/api/`
- **Endpoints Used**:
  - `GET /api/retailers`
  - `GET /api/stores?retailer_id&lat&lng&radius_km=…`
  - `GET /api/products/search?q=…`
  - `POST /api/plan`
  - `GET /api/plan/{plan_id}`
  - `GET /api/clickcollect/{retailer_id}/rules`
- **Plan JSON**: Strictly validate against `Plan_v1` schema before rendering

---

## Component Breakdown

- `App` — Main app logic, animated transitions between views
- `LandingPage` — Animated hero section, cycling headlines, Get Started button
- `CardContainer` — Shopping list input form (currently inline in App)
- *(Planned/Upcoming)*
  - `Header`
  - `ShoppingForm`
  - `LocationAutocomplete`
  - `PreferencesPanel`
  - `StoreFilter`
  - `ResultsPage`
  - `StoreCard`
  - `BasketList`
  - `SavingsHeadline`
  - `SummarySection`
  - `AssumptionsWarnings`
  - `ClickCollectButton`
  - `DownloadPlanButton`

---

## Acceptance Criteria

- Follows ShopLyft project prompt and Plan JSON contract
- All user flows are smooth, minimal, and accessible
- Strict type safety and schema validation
- No external data; mock JSON only
- All disabled actions have tooltips
- Savings and time summary always visible
- Documentation and spec kept in sync with codebase

---

Refer to `PromptSpec.md` for detailed design and implementation guidelines.
