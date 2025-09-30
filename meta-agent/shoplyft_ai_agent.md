# 🛒 ShopLyft – AI Agent Specification

This document defines the **AI Agent** for **ShopLyft**, focusing on:
- The agent’s **role and responsibilities**
- Full **function list** with Python-style signatures
- The **planning workflow**
- Integration with **ConnectOnion**
- Guardrails and output contract

---

## 🌟 Agent Role

The AI Agent is responsible for:
- Parsing the user’s shopping list and location
- Fetching product prices and store data from mock JSON datasets
- Optimising store assignments and route
- Enforcing click-and-collect rules
- Computing totals, savings, and timing estimates
- Producing:
  - A valid `Plan_v1` JSON object
  - A Markdown summary for the frontend

---

## 🟢 Core Planning Functions

| Function | Purpose |
|----------|---------|
| `normalize_shopping_list(raw_items)` | Standardise raw shopping list into canonical IDs. |
| `match_candidates(canonical_id, retailer_id)` | Retrieve candidate products for each canonical item. |
| `build_initial_assignment(shopping_list, candidate_stores)` | Allocate items to stores based on unit price. |
| `apply_max_store_cap(assignment, max_stores)` | Limit number of stores in the plan. |
| `rebalance_for_min_spend(assignment, rules)` | Reassign items to meet min-spend thresholds while optimising weighted score. |
| `tsp_order(stores, travel_matrix)` | Compute optimal store visit order. |
| `score_plan(baskets, route, weights)` | Compute weighted score (default: 80% cost / 20% time). |

### Python Signatures
```python
from typing import List, Dict, Any

def normalize_shopping_list(raw_items: List[str]) -> List[Dict[str, Any]]: ...
def match_candidates(canonical_id: str, retailer_id: str) -> List[Dict[str, Any]]: ...
def build_initial_assignment(
    shopping_list: List[Dict[str, Any]],
    candidate_stores: List[Dict[str, Any]]
) -> Dict[str, Any]: ...
def apply_max_store_cap(assignment: Dict[str, Any], max_stores: int) -> Dict[str, Any]: ...
def rebalance_for_min_spend(
    assignment: Dict[str, Any],
    rules: Dict[str, Any]
) -> Dict[str, Any]: ...
def tsp_order(stores: List[Dict[str, Any]], travel_matrix: List[List[float]]) -> List[Dict[str, Any]]: ...
def score_plan(
    baskets: Dict[str, Any],
    route: List[Dict[str, Any]],
    weights: Dict[str, float]
) -> float: ...
