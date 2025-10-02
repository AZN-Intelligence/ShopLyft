# ShopLyft Frontend

A modern, minimal React web application for ShopLyft's grocery shopping optimization platform. Built with **React 19**, **TypeScript**, **TailwindCSS v4.1**, and **Framer Motion** for smooth animations and excellent user experience.

## 🚀 Features

- **Three-Stage User Flow**: Landing → Loading → Plan Display
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Interactive Shopping List Input**: Paper-style memo with geolocation
- **Real-Time Progress Tracking**: Animated loading with character feedback
- **Route Visualization**: Google Maps integration with expandable modal
- **Browser Extension Integration**: Automated cart management
- **Error Handling**: Graceful fallbacks with user-friendly messages

## 🛠️ Tech Stack

- **React 19** — Latest React with concurrent features and hooks
- **TypeScript** — Strict type safety throughout the codebase
- **Vite** — Lightning-fast build tool and development server
- **TailwindCSS v4.1** — Utility-first CSS with custom orange color system
- **Framer Motion** — Smooth animations and page transitions
- **Axios** — HTTP client with request/response interceptors
- **Google Maps API** — Route visualization and directions

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

## 📁 Project Structure

```
frontend/
├── 📁 src/                        # Source code
│   ├── 📁 components/             # React components organized by feature
│   │   ├── 📁 LandingSection/     # Landing page components
│   │   │   ├── LandingPage.tsx           # Main landing container
│   │   │   ├── DesktopLandingContent.tsx # Desktop layout
│   │   │   ├── MobileLandingContent.tsx  # Mobile layout
│   │   │   ├── FloatingMemo.tsx          # Shopping list input
│   │   │   ├── MobileFloatingMemo.tsx    # Mobile memo wrapper
│   │   │   ├── ProductTitle.tsx          # Brand title display
│   │   │   └── FeatureContainers.tsx     # Feature highlights
│   │   ├── 📁 LoadingSection/     # Loading screen components
│   │   │   ├── LoadingScreen.tsx         # Main loading container
│   │   │   ├── LoadingCharacter.tsx      # Animated ShopLyfter character
│   │   │   ├── LoadingContent.tsx        # Progress indicators
│   │   │   └── ErrorBubble.tsx           # Error display with animations
│   │   └── 📁 PlanSection/        # Shopping plan display components
│   │       ├── PlanLayout.tsx            # Responsive plan layout
│   │       ├── PlanHeader.tsx            # Receipt-style summary
│   │       ├── RoutePlan.tsx             # Step-by-step route
│   │       ├── RouteMap.tsx              # Google Maps integration
│   │       ├── MobileToggle.tsx          # Mobile tab switcher
│   │       ├── AddToCartButton.tsx       # Cart automation
│   │       ├── SupermarketIcon.tsx       # Retailer brand icons
│   │       └── planTemplate.ts           # TypeScript interfaces
│   ├── 📁 hooks/                  # Custom React hooks
│   │   └── useOptimization.ts     # Shopping optimization logic
│   ├── 📁 services/               # API and external service integrations
│   │   └── api.ts                 # Axios-based API client
│   ├── 📁 assets/                 # Static images and media files
│   │   ├── aldi-bg.png            # ALDI brand image
│   │   ├── coles-bg.png           # Coles brand image
│   │   ├── woolworth-bg.webp      # Woolworths brand image
│   │   ├── shoplyfter-bg-removed.png     # Main character
│   │   └── shoplyfter-error.png          # Error character
│   ├── App.tsx                    # Main app orchestrator
│   ├── main.tsx                   # React entry point with StrictMode
│   └── index.css                  # TailwindCSS import
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # TailwindCSS configuration
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Design Guidelines

- Minimal, modern design: whitespace, clear hierarchy, readable fonts
- Custom color system: primary, secondary, neutral, orange scale (Tailwind config)
- Animations: Framer Motion for page transitions, button hovers, savings counter
- Accessibility: Keyboard navigation, ARIA labels, color contrast
- Responsiveness: Mobile-first, adaptive layouts
- Tooltips: For disabled actions (e.g., min spend not met)
- Error Handling: Friendly fallback UI, warnings per spec

---

## 🔌 Backend Integration

The frontend communicates with the ShopLyft FastAPI backend for shopping optimization.

### API Configuration

- **Base URL**: `VITE_API_BASE_URL` (default: `http://localhost:8000`)
- **Timeout**: 2 minutes for optimization requests
- **Client**: Axios with request/response interceptors

### Main Endpoint

- `POST /api/v1/optimization/optimize` — Shopping plan optimization

### Data Flow

1. User inputs shopping list → `FloatingMemo.tsx`
2. Triggers optimization → `useOptimization.ts` hook
3. API call → `api.ts` service
4. Backend processing → AI parsing + route optimization
5. Response → Plan display in `PlanLayout.tsx`

---

## Component Architecture & Data Flow

### Core Application Flow

1. **App.tsx** — Main orchestrator managing three states: `landing` → `loading` → `roadmap`
2. **LandingPage.tsx** — Handles user input and triggers optimization via custom events
3. **LoadingScreen.tsx** — Shows progress during API optimization with character animations
4. **PlanLayout.tsx** — Displays optimized shopping plan with responsive layouts

### Key Component Interactions

#### Landing Section

- **LandingPage.tsx** — Container with responsive desktop/mobile layouts
- **FloatingMemo.tsx** — Interactive shopping list input with geolocation and paper-style UI
- **ProductTitle.tsx** — Brand display with staggered animations
- **FeatureContainers.tsx** — Feature highlights with hover effects

#### Loading Section

- **LoadingScreen.tsx** — Manages loading states and error handling
- **LoadingCharacter.tsx** — Animated ShopLyfter character with speed lines
- **LoadingContent.tsx** — Progress messages and animated dots
- **ErrorBubble.tsx** — Comic-style error display with character animations

#### Plan Section

- **PlanLayout.tsx** — Responsive grid layouts (desktop: 2-column, tablet: 2x2, mobile: stacked)
- **PlanHeader.tsx** — Receipt-style summary showing savings and "Add All" functionality
- **RoutePlan.tsx** — Step-by-step route with store cards and travel segments
- **RouteMap.tsx** — Google Maps integration with expandable modal
- **MobileToggle.tsx** — Tab switcher for mobile plan/map views
- **AddToCartButton.tsx** — Dispatches custom events for browser extension integration

### State Management

- **App.tsx** — Manages page transitions via `currentStep` state
- **useOptimization.ts** — Handles API calls, progress tracking, and error states
- **Custom Events** — Communication between components via `window.dispatchEvent`

### Component Data Flow

```
App.tsx (State: landing → loading → roadmap)
├── LandingPage.tsx
│   ├── FloatingMemo.tsx (User Input)
│   │   └── useOptimization.ts (API Hook)
│   │       └── api.ts (HTTP Client)
│   └── Custom Events → App.tsx
├── LoadingScreen.tsx
│   ├── LoadingCharacter.tsx (Animations)
│   ├── LoadingContent.tsx (Progress)
│   └── ErrorBubble.tsx (Error Handling)
└── PlanLayout.tsx
    ├── PlanHeader.tsx (Savings Summary)
    ├── RoutePlan.tsx (Store Route)
    │   └── AddToCartButton.tsx → Browser Extension
    └── RouteMap.tsx (Google Maps)
```

---

## 🎨 UI/UX Features

- **Responsive Layouts**: Desktop (2-column), tablet (2x2 grid), mobile (stacked)
- **Framer Motion Animations**: Page transitions, character movements, micro-interactions
- **ShopLyfter Character**: Contextual animations for loading, errors, and success states
- **Paper-Style Input**: Realistic memo pad with red margin lines and blue ruled lines
- **Interactive Maps**: Google Maps integration with expandable modal view
- **Real-Time Progress**: Visual feedback during optimization with progress indicators

## ⚙️ Technical Features

- **TypeScript**: End-to-end type safety with strict configuration
- **Custom Hooks**: `useOptimization` for state management and API integration
- **Event-Driven**: Component communication via `window.dispatchEvent`
- **Error Boundaries**: Graceful error handling with fallback UI
- **Template Data**: Development fallback when backend is unavailable
- **Geolocation**: Automatic location detection with manual override option

## Environment Variables

- `VITE_API_BASE_URL` — Backend API base URL (default: `http://localhost:8000`)
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key for route visualization
- `VITE_MODE` — Environment mode (`prod` for production error handling)

## 🔗 Browser Extension Integration

The frontend communicates with the ShopLyft browser extension via custom events:

- `shoplyft-add-to-cart` — Triggered by `AddToCartButton.tsx` to automate cart management
- `navigateToLoading` — Internal event for loading screen transition
- `navigateToPlan` — Internal event for plan display with optimization data
- `optimizationError` — Internal event for error handling and fallbacks

## 🚀 Development

### Local Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Key Development Files

- `vite.config.ts` — Build configuration
- `tailwind.config.js` — Custom color system and utilities
- `tsconfig.json` — TypeScript strict mode configuration
- `package.json` — Dependencies and scripts

---

_This frontend provides a modern, accessible, and performant user interface for the ShopLyft grocery optimization platform._
