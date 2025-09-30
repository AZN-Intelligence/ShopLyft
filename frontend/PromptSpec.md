# ShopLyft Frontend Prompt Spec

## Overview

A modern, minimal web app for ShopLyft, built with **React 19**, **TypeScript**, **TailwindCSS v4.1**, and **Framer Motion**. The UI features smooth, non-distracting animations, a custom color system, and clear user flows for optimal shopping plan generation.

---

## 1. Tech Stack

- **React 19** (functional components, hooks)
- **TypeScript** (strict types)
- **TailwindCSS v4.1** (utility-first, responsive, custom color schema)
- **Framer Motion** (animated transitions, interactive UI)
- **Axios** (API calls)

---

## 2. Page Structure & Flow

### 2.1 Landing / Home

- **Header**: Logo, tagline, minimal nav *(planned)*
- **LandingPage**: Animated hero section, cycling headlines, "Get Started" button (Framer Motion)

### 2.2 Shopping Plan Form

- **CardContainer**: Shopping list input form (currently inline in App)
- **Shopping List Input**: Free text + structured (chips/tags)
- **Location Input**: Autocomplete suburb or detect via browser geolocation *(planned)*
- **Preferences**:
  - Substitutions toggle *(planned)*
  - Dietary tags (multi-select) *(planned)*
  - Max stores (slider, default 3) *(planned)*
  - Time vs Cost weighting (slider, default 20/80) *(planned)*
- **Store Filter**: Multi-select (Woolworths, Coles, ALDI) *(planned)*
- **Submit Button**: Animated, disables on invalid input *(planned)*

### 2.3 Results Page *(planned)*

- **Savings Headline**: Large, animated number, always at top
- **Store Route**: Card per store, ordered, with:
  - Store name, address, ETA (travel + in-store)
  - Basket: items, substitutions flagged
  - Click & Collect eligibility (button enabled/disabled, tooltip reason)
- **Summary Section**: Total time, total savings, baseline comparison
- **Assumptions & Warnings**: Collapsible, clear icons
- **Actions**: Create C&C cart, download plan JSON

---

## 3. UI/UX Guidelines

- Minimal, modern design: whitespace, clear hierarchy, readable fonts
- Custom color system: primary, secondary, neutral, orange scale (Tailwind config)
- Animations: Framer Motion for page transitions, button hovers, savings counter
- Accessibility: Keyboard navigation, ARIA labels, color contrast
- Responsiveness: Mobile-first, adaptive layouts
- Tooltips: For disabled actions (e.g., min spend not met)
- Error Handling: Friendly fallback UI, warnings per spec

---

## 4. API Integration

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

## 5. Component Breakdown

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

## 6. Animation & Interaction

- Page transitions: Fade/slide with Framer Motion
- Savings counter: Animated number increment
- Button hovers: Scale, color transitions
- Basket reveal: Staggered item fade-in *(planned)*
- Tooltip popups: Smooth fade

---

## 7. Acceptance Criteria

- Follows ShopLyft project prompt and Plan JSON contract
- All user flows are smooth, minimal, and accessible
- Strict type safety and schema validation
- No external data; mock JSON only
- All disabled actions have tooltips
- Savings and time summary always visible
- Documentation and spec kept in sync with codebase

---

## 8. Next Steps

- Scaffold React app with TypeScript & Tailwind *(done)*
- Implement ShoppingForm and ResultsPage *(in progress)*
- Integrate API endpoints with mock data *(planned)*
- Add Framer Motion for core animations *(done)*
- Refactor CardContainer into its own file *(planned)*
- Review with team for UX feedback
