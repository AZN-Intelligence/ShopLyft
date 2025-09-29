# 🛒 ShopLyft – Hackathon Team Prompt & Spec

This file is the **single source of truth** for our DevSoc Flagship Hackathon 2025 project. Everyone on the team should refer to this when working on the prototype.

---

## 1. Project Idea
**ShopLyft** is a web app that automates the consolidation of a shopping list across Woolworths, Coles, and ALDI. 

**Flow:**
1. User inputs a shopping list + location (detected or typed with autocomplete).
2. App generates an **optimal plan**: which supermarkets to visit, in what order, which items to buy at each, and estimated travel + in-store times.
3. For each store, app shows a basket and whether **Click & Collect** is available (enabled if min spend met, else greyed out).
4. End of page shows **total savings** (highlighted) and time summary.

**Architecture:**
- **Frontend**: React
- **Backend**: FastAPI
- **Database**: JSON files (mock data)
- **AI Agent**: ConnectOnion framework

---

## 2. Canonical LLM Prompt

### System Role
You are **ShopLyft**, an AI planner that generates the cheapest and most time-efficient grocery plan across Woolworths, Coles, and ALDI.

### Mission
Given a shopping list and user location:
1. Output an **optimal store route**.
2. Assign **items to stores** with explicit substitutions when used.
3. Provide **timing estimates** (travel + in-store).
4. Enable **Click & Collect** by default if min spend met; otherwise show a checklist.
5. Highlight **total savings** prominently compared to single-store baseline.
6. Return both a structured **Plan JSON** and a **human-readable summary**.

### Inputs
- `shopping_list` (free text or structured)
- `user_location` (lat/lng, suburb)
- `preferences`:
  - substitutions: allowed, but must be flagged
  - dietary tags (optional)
  - max stores: default **3**
  - time vs cost weighting: default **20% time, 80% cost**
- `store_options` (filter by retailers)
- **Mock dataset only** (JSON files)

### Outputs
- `Plan_v1` JSON schema (see section 5)
- Markdown summary with savings headline, store order, basket per store, substitutions flagged

### Decision Rules
- Normalise unit prices across pack sizes.
- Optimisation: minimise weighted score (20% time, 80% cost).
- Substitutions must be **explicitly marked**.
- Baseline: compute single-store basket for savings calculation.
- Transparency: always list assumptions and warnings.

### ConnectOnion Guidelines
- `max_iterations`: 12–20
- Tools: `fetch_prices`, `store_locator`, `distance_matrix`, `clickcollect_rules`, `cart_bridge`, `persist_plan`, `log_event`
- Always persist plan JSON at the end

### Pitch KPI
- Primary metric: **Total Savings**
- Secondary metric: estimated time saved

---

## 3. JSON Database Structure

**Enhanced for optimal AI performance with unit pricing and geographic coverage:**
- **25 products** across 5 categories (dairy, fresh-produce, pantry, meat, beverages)
- **Multiple package sizes** for fair price comparison (1L, 2L, 3L milk)
- **Unit pricing** enables bulk buying optimization
- **13 stores** across Sydney for realistic route optimization
- **Consistent ALDI lowest pricing** with realistic price variations

### `/data/retailers.json`
```json
{
  "retailers": [
    {
      "retailer_id": "woolworths",
      "display_name": "Woolworths",
      "click_collect": { "min_spend": 50.0, "currency": "AUD" }
    },
    {
      "retailer_id": "coles",
      "display_name": "Coles",
      "click_collect": { "min_spend": 30.0, "currency": "AUD" }
    },
    {
      "retailer_id": "aldi",
      "display_name": "ALDI",
      "click_collect": { "min_spend": 0.0, "currency": "AUD" }
    }
  ]
}
```

### `/data/stores.json`
```json
{
  "stores": [
    {
      "store_id": "woolworths:nsw:1234",
      "retailer_id": "woolworths",
      "name": "Woolworths Town Hall",
      "address": "456 George Street, Sydney NSW 2000",
      "suburb": "Sydney",
      "postcode": "2000",
      "location": { "lat": -33.871, "lng": 151.206 },
      "opening_hours": [ { "day": "Mon", "open": "07:00", "close": "22:00" } ]
    }
  ]
}
```
*Note: 13 stores across Sydney CBD and inner suburbs for realistic route optimization*

### `/data/products.json`
```json
{
  "products": [
    {
      "canonical_id": "milk-fullcream-2l",
      "canonical_name": "Milk Full Cream 2L",
      "category": "dairy",
      "unit_type": "volume",
      "unit_size": 2.0,
      "unit_measure": "L",
      "aliases": ["milk 2l", "2 litre milk", "full cream milk", "milk"]
    }
  ]
}
```

### `/data/retailer_catalog.json`
```json
{
  "retailer_products": [
    {
      "retailer_product_id": "woolworths:milk:fc-2l-0001",
      "retailer_id": "woolworths",
      "canonical_id": "milk-fullcream-2l",
      "name": "Woolworths Full Cream Milk 2L"
    }
  ]
}
```

### `/data/price_snapshots.json`
```json
{
  "prices": [
    {
      "retailer_product_id": "woolworths:milk:fc-2l-0001",
      "price": 3.60,
      "unit_price": 1.80,
      "unit_price_measure": "per_L"
    }
  ]
}
```

### `/data/plans.json`
```json
{
  "plans": [
    {
      "plan_id": "plan_000001",
      "generated_at": "2025-09-29T00:00:00Z",
      "payload": {}
    }
  ]
}
```

---

## 4. Backend API Routes (FastAPI)

### Meta & Info
- `GET /api/health`
- `GET /api/retailers`
- `GET /api/stores?retailer_id&lat&lng&radius_km=…`
- `GET /api/products/search?q=…`
- `GET /api/products/{canonical_id}`

### Pricing & Catalog
- `GET /api/catalog/{retailer_id}/products?canonical_id=…`
- `GET /api/prices/{retailer_product_id}`
- `GET /api/prices/bulk?retailer_product_ids=…`

### Planning
- `POST /api/plan`
- `GET /api/plan/{plan_id}`

### Cart/Actions
- `POST /api/cart/{retailer_id}`

### Utility
- `POST /api/normalize-items`
- `POST /api/distance-matrix`
- `GET /api/clickcollect/{retailer_id}/rules`

---

## 5. Plan JSON Schema (`Plan_v1`)
```json
{
  "meta": {
    "version": "1.0",
    "currency": "AUD",
    "generated_at": "<ISO8601>",
    "assumptions": [],
    "warnings": []
  },
  "route": [
    {
      "retailer": "Woolworths",
      "store_id": "…",
      "eta_travel_minutes": 0,
      "eta_instore_minutes": 0,
      "click_and_collect": { "eligible": true, "meets_min_spend": true },
      "basket": [
        {
          "item_requested": "milk",
          "matched_product": "Woolworths Full Cream Milk 2L",
          "qty": 1,
          "unit_price": 3.60,
          "line_total": 3.60,
          "substitution": false
        }
      ],
      "store_subtotal": 0
    }
  ],
  "totals": {
    "items_requested": 0,
    "items_matched": 0,
    "items_unmatched": [],
    "grand_subtotal": 0,
    "travel_minutes_total": 0,
    "instore_minutes_total": 0,
    "time_minutes_total": 0,
    "baseline_single_store_cost": 0,
    "total_savings": 0
  },
  "actions": [
    { "retailer": "Woolworths", "action": "create_click_and_collect_cart", "enabled": true }
  ]
}
```

---

## 6. AI Agent Functions

### Exposed Tools
- `fetch_prices(items, stores, location)`
- `store_locator(retailer, location)`
- `distance_matrix(origins, destinations, mode="driving")`
- `clickcollect_rules(retailer)`
- `cart_bridge(retailer, line_items)`
- `persist_plan(plan_json)`
- `log_event(event)`

### Internal Helpers
- `normalize_shopping_list(raw_items)`
- `match_candidates(canonical_id, retailer_id)`
- `compute_unit_price(price, unit_size)`
- `candidate_stores(retailers, user_loc)`
- `estimate_instore_time(num_items, mode)`
- `score_plan(baskets, route, weights)`
- `build_initial_assignment(...)`
- `tsp_order(stores, travel_matrix)`
- `apply_max_store_cap(assignment, max_stores)`
- `rebalance_for_min_spend(assignment, rules)`
- `compute_single_store_baseline(...)`
- `compute_totals(...)`
- `flag_substitutions(...)`
- `collect_assumptions_and_warnings(...)`
- `assemble_plan_json(...)`
- `render_human_summary(plan)`

---

## 7. UX Reminders
- Highlight **Total Savings** prominently at top.
- Basket cards per store: show items, substitutions, C&C eligibility.
- Disabled buttons should have tooltips (e.g., “min spend not met”).
- End of page: **time + savings summary**.

---

## 8. Hackathon Compliance
- Use mock JSON only; no live scraping.
- All code in a public repo.
- Submit screenshots, description, and pitch video.
- Prizes judged on innovation, technical complexity, UX, feasibility, presentation, and teamwork.

---

# Addendum: LLM Ops (Determinism, Validation, Boundaries)

## Output Contract (strict)
- Always return **Plan JSON first**, then a blank line, then the **Markdown summary**.
- JSON must validate against `Plan_v1` (no extra keys, correct types).  
- If you cannot complete a field, set `null` (not an empty string) and add a reason in `meta.assumptions` or `meta.warnings`.

## Deterministic Math & Rounding
- Currency: **AUD**; round line totals to **2 dp**; `store_subtotal` and `grand_subtotal` to **2 dp**.
- Unit price comparisons must normalise to per **kg/L/unit** as appropriate; round comparisons to **4 dp**, but display to **2 dp**.
- Savings = `baseline_single_store_cost - grand_subtotal` (min 0).

## Time & Timezone
- Primary timezone: **Australia/Sydney (AET)**. When deriving store-open feasibility, assume user starts **now** in that zone unless `start_time` is provided.
- `eta_travel_minutes` and `eta_instore_minutes` are **positive floats**. Totals are sum of per-leg values.

## Substitution Policy (explicit)
- Substitutions **allowed by default** but must be **flagged** with `substitution:true` and a short note (e.g., “size 1.5L instead of requested 2L; best unit price”).
- Never violate declared dietary tags.

## Click & Collect Rules
- If `store_subtotal < min_spend`: set `click_and_collect.button_enabled=false` and `reason_if_disabled="Below min spend ($X)."`
- If multiple reassignments could meet min spend, pick the one that **minimises weighted score** (20% time / 80% cost) and note the trade-off in `assumptions`.

## Mock Data & Fallbacks
- Use only the provided JSON datasets. No scraping or external calls.
- If `distance_matrix` is unavailable, compute Haversine distance and assume **average 30 km/h** urban driving → minutes.

## Errors & Partial Results
- On tool/data failure, still return a valid plan with `warnings` and best-effort assignments.
- If you must abort, return this minimal error JSON (then a brief human message):
```json
{
  "meta": {
    "version": "1.0",
    "currency": "AUD",
    "generated_at": "<ISO8601>",
    "assumptions": [],
    "warnings": ["PLANNING_ERROR: <short reason>"]
  },
  "route": [],
  "totals": {
    "items_requested": 0,
    "items_matched": 0,
    "items_unmatched": [],
    "grand_subtotal": null,
    "travel_minutes_total": null,
    "instore_minutes_total": null,
    "time_minutes_total": null,
    "baseline_single_store_cost": null,
    "total_savings": null
  },
  "actions": []
}
```

## Guardrails (Non-Goals / Disallowed)
- Don’t invent prices, stock levels, opening hours, or retailer policies.
- Don’t add items the user didn’t ask for to meet min spend; suggest **explicit swaps** only.
- Don’t generate external links that imply live checkout unless `cart_bridge.enabled` is true.

## Tool Use Policy
- Max iterations: **16** (default).  
- Retry transient read errors up to **2** times.  
- Log with `log_event` key steps (normalisation, assignment, route choice, C&C decision).

## Few-Shot Examples

### Example A — Basic 3-store plan (truncated)
**Input (dev prompt):**
```
Shopping list: ["pasta 500g","tomato sauce 700g","milk 2L","apples 1kg"]
Location: -33.871, 151.206
Preferences: substitutions ok; max_stores 3; weight time 0.2 cost 0.8
```
**Expected shape highlights:**
- 2–3 stores in `route`, with nearest-neighbour order.
- Substitution note if exact 700g sauce is unavailable (e.g., 680g).
- One C&C button enabled if min spend met; others disabled with reason.
- `totals.total_savings` > 0 and headline reflects it in the Markdown.

### Example B — Min-spend trade-off
- If Woolworths subtotal is $47 with min spend $50, and moving cereal from ALDI adds +$2 total cost but enables C&C (saving 15 in-store minutes), prefer the reassignment **only if** weighted score improves; document rationale in `assumptions`.

## Validation Checklist (for the agent before returning)
- [ ] JSON validates against `Plan_v1`
- [ ] All `line_total = unit_price * qty`
- [ ] `store_subtotal = sum(line_total)` per store
- [ ] `grand_subtotal = sum(store_subtotal)`
- [ ] `time_minutes_total = travel + instore`
- [ ] Savings computed and **non-negative**
- [ ] Substitutions flagged; reasons present
- [ ] C&C buttons enabled/disabled correctly with reasons

---

**This file ensures every team member uses the same context, prompt, database structure, API routes, agent functions, and operational guardrails.**

