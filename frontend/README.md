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

```
frontend/src/
├── main.tsx                    # React app entry point with root rendering
├── App.tsx                     # Main app component with view state management
├── index.css                   # Global styles and Tailwind CSS imports
├── assets/                     # Static assets (images, icons, etc.)
└── components/                 # Component library organized by feature
    ├── types/
    │   └── index.ts            # Shared TypeScript interfaces and types
    ├── shared/                 # Reusable components across features
    │   ├── ui/
    │   │   └── StepContainer.tsx    # Motion wrapper for form steps
    │   ├── forms/
    │   │   ├── StepHeader.tsx       # Title and description component
    │   │   └── NavigationButtons.tsx # Back/Continue navigation buttons
    │   └── layout/
    │       └── CardContainer.tsx    # Responsive card wrapper component
    └── features/               # Feature-specific components
        ├── landing/            # Landing page feature
        │   └── LandingPage/
        │       ├── LandingPage.tsx      # Main landing page container
        │       ├── AnimatedHeadline.tsx # Cycling headline animation
        │       ├── DesktopLandingView.tsx # Desktop layout with text-first
        │       ├── MobileLandingView.tsx  # Mobile layout with icon-first
        │       ├── LandingContent.tsx     # Description text component
        │       └── GetStartedButton.tsx   # CTA button with variants
        └── shopping/           # Shopping list feature
            ├── ShoppingListForm.tsx    # Main multi-step form container
            ├── ItemSelectionGrid.tsx   # Grid for common item selection
            ├── CustomInputToggle.tsx   # Toggle with textarea for custom input
            ├── ItemDetailsForm.tsx     # Quantity and notes input form
            ├── LocationSelector.tsx    # Location selection with geolocation
            ├── ShoppingListTable.tsx   # Editable shopping list table
            ├── LoadingAnimation.tsx    # Loading state with animated cart
            ├── PlanLayout.tsx          # Final plan display component
            └── ShoppingCartIcon.tsx    # Animated shopping cart icon
```

- `public/` — Static files (e.g., favicon)
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

## Component Architecture

### **Shared Components** (Reusable across features)

- `StepContainer` — Motion wrapper with consistent animations for form steps
- `StepHeader` — Standardized title and description layout
- `NavigationButtons` — Back/Continue buttons with consistent styling
- `CardContainer` — Responsive card wrapper with mobile/desktop variants

### **Landing Page Feature**

- `LandingPage` — Main container with responsive view switching
- `AnimatedHeadline` — Cycling headline animation with typewriter effect
- `DesktopLandingView` — Desktop layout (text-first, icon-second)
- `MobileLandingView` — Mobile layout (icon-first, text-second)
- `LandingContent` — Description text with alignment variants
- `GetStartedButton` — CTA button with size variants

### **Shopping List Feature**

- `ShoppingListForm` — Multi-step form container with state management
- `ItemSelectionGrid` — Grid layout for common grocery item selection
- `CustomInputToggle` — Toggle switch with expandable textarea
- `ItemDetailsForm` — Form for editing quantities and notes
- `LocationSelector` — Location input with geolocation support
- `ShoppingListTable` — Editable table with add/edit/remove functionality
- `LoadingAnimation` — Loading state with animated shopping cart
- `PlanLayout` — Final plan display with store cards and savings
- `ShoppingCartIcon` — Animated cart icon with size variants

### **Type Definitions**

- `types/index.ts` — Centralized TypeScript interfaces for all components

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
