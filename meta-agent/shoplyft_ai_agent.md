# 🛒 ShopLyft – AI Agent Specification

This document defines the **AI Agent** for **ShopLyft** with a **new architecture**:
- **Clear separation**: AI parsing → Route chooser → Optimization → Action plan
- **LLM** handles only natural language processing (grocery list parsing)
- **Pure algorithms** handle route generation, scoring, and optimization
- **Deterministic optimization** with configurable time/price weighting

---

## 🌟 Agent Role (Updated)

The AI Agent is responsible for:
- **AI Parsing**: Parse grocery list into products from products.json
- **Route Chooser**: Multi-part algorithmic optimization:
  - Generate dataset of (item, price, store) for all items
  - Generate all possible routes for all stores considered
  - Score routes based on time (20%) and price (80%)
  - Find optimal route with best score
- **Action Plan**: Display optimal route as structured action plan

---

## 🟢 New Architecture Functions

### AI Functions (Natural Language Processing)
| Function | Purpose |
|----------|---------|
| `parse_grocery_list_to_products(raw_grocery_list)` | Use AI to parse natural language grocery list into products.json items. |

### Route Chooser Functions (Algorithmic Optimization)
| Function | Purpose |
|----------|---------|
| `create_optimal_shopping_plan(grocery_list, starting_location, max_stores, time_weight, price_weight)` | **Main orchestrator** - coordinates the entire optimization process. |
| `generate_price_dataset(parsed_products)` | Generate dataset of (item, price, store) for every item in the list. |
| `generate_all_possible_routes(price_dataset, user_location, max_stores)` | Generate all possible routes for all stores considered. |
| `score_route(route, price_dataset, user_location, time_weight, price_weight)` | Score routes based on time (20%) and price (80%). |
| `find_optimal_route(all_routes, price_dataset, user_location, time_weight, price_weight)` | Find route with best score. |
| `generate_action_plan(optimal_route, user_location)` | Display optimal route as action plan. |

### Utility Functions
| Function | Purpose |
|----------|---------|
| `parse_location(location_input)` | Parse coordinates or English location names. |
| `calculate_travel_time(user_location, route_stores)` | Calculate travel time using Haversine distance. |
| `haversine_distance(lat1, lng1, lat2, lng2)` | Calculate distance between two points in km. |

### Key Python Signatures
```python
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel

class ParsedProduct(BaseModel):
    canonical_id: str
    canonical_name: str
    requested_item: str
    quantity: int = 1
    confidence: float

class ParsedShoppingList(BaseModel):
    parsed_products: List[ParsedProduct]
    unmatched_items: List[str]
    parsing_confidence: float

# Main orchestrator function
def create_optimal_shopping_plan(
    raw_grocery_list: str,
    starting_location: str,
    max_stores: int = 3,
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> str: ...

# AI parsing function
def parse_grocery_list_to_products(raw_grocery_list: str) -> str: ...

# Route chooser functions
def generate_price_dataset(parsed_products: List[ParsedProduct]) -> List[Dict[str, Any]]: ...
def generate_all_possible_routes(
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    max_stores: int = 3
) -> List[Dict[str, Any]]: ...
def score_route(
    route: Dict[str, Any], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]: ...
def find_optimal_route(
    all_routes: List[Dict[str, Any]], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]: ...
```

---

## 🔄 Architecture Flow

### Input Processing
1. **Location Parsing**: Convert starting location to coordinates
2. **AI Parsing**: Parse grocery list into products.json items using LLM

### Route Chooser (Multi-part Algorithm)
1. **Price Dataset Generation**: For every item, get price and available stores
2. **Route Generation**: Generate all possible combinations and permutations of stores
3. **Route Scoring**: Score each route based on:
   - **Price component** (80% weight): Total cost of items assigned to cheapest stores in route
   - **Time component** (20% weight): Travel time + in-store time
4. **Optimal Route Selection**: Route with lowest total score

### Output Generation
1. **Action Plan Creation**: Display optimal route with:
   - Store order and addresses
   - Shopping list per store
   - Click & Collect eligibility
   - Total cost and time breakdown

---

## 📊 Optimization Algorithm Details

### Route Generation
- Generate all combinations of 1 to max_stores stores
- Generate all permutations of each combination
- Each route represents a different store visit order

### Item Assignment Strategy
- For each route, assign each item to the cheapest available store in that route
- This ensures optimal price within route constraints

### Scoring System
- **Price Score**: Total cost normalized to $100 scale
- **Time Score**: Total time normalized to 120 minutes scale
- **Weighted Score**: (price_weight × price_score) + (time_weight × time_score)
- **Lower score is better**

### Time Calculations
- **Travel Time**: Haversine distance ÷ 30 km/h average speed
- **In-Store Time**: 2 minutes per item
- **Total Time**: Travel time + in-store time

---

## 🎯 Performance Characteristics

### Scalability
- **Route Generation**: O(n! × k) where n = max_stores, k = number of store combinations
- **Scoring**: O(m × n) where m = number of routes, n = number of items
- **Memory**: O(m × n) for storing all routes and scores

### Optimization Quality
- **Exhaustive Search**: Considers all possible routes
- **Optimal Solution**: Guaranteed to find globally optimal route
- **Trade-offs**: Higher max_stores increases computation time exponentially

---

## 🔧 Configuration Options

### Weights
- `time_weight`: Default 0.2 (20%)
- `price_weight`: Default 0.8 (80%)
- Must sum to 1.0

### Constraints
- `max_stores`: Default 3, maximum number of stores in route
- `max_iterations`: Default 8, reduced since main work is in algorithms

### Data Sources
- **products.json**: Product definitions and aliases for AI parsing
- **stores.json**: Store locations and addresses for route planning  
- **price_snapshots.json**: Current prices for cost optimization
- **retailer_catalog.json**: Product availability by retailer
- **retailers.json**: Retailer rules (Click & Collect, etc.)

---

## 🛒 Click & Collect Integration

### Minimum Spend Requirements
- **ALDI**: $0 (always eligible)
- **Coles**: $30 minimum spend
- **Woolworths**: $50 minimum spend

### Eligibility Display
- Show eligibility status for each store
- Display deficit amount if below minimum spend
- Include in action plan recommendations

---

## 🎯 Use Cases & Examples

### Example 1: Basic Shopping
```
Input: "milk, bread, eggs"
Output: Single store route (ALDI) with lowest total cost
```

### Example 2: Multi-Store Optimization
```
Input: "milk, bread, eggs, pasta, olive oil, chicken"
Output: 2-store route (ALDI + Woolworths) balancing cost and time
```

### Example 3: Time-Priority Shopping
```
Input: "milk, bread" with time_weight=0.8, price_weight=0.2
Output: Single store route prioritizing minimal time over cost
```

This architecture provides a clear separation of concerns, deterministic optimization, and configurable trade-offs between cost and time efficiency.