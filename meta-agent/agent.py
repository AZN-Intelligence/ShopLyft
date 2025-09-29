# ShopLyft AI Agent - Grocery Shopping Optimization

import json
import math
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pathlib import Path
from connectonion import Agent

# Data loading functions
def load_json_data(filename: str) -> Dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_json_data(filename: str, data: Dict) -> str:
    """Save JSON data to the data directory."""
    data_path = Path(__file__).parent.parent / "data" / filename
    with open(data_path, 'w') as f:
        json.dump(data, f, indent=2)
    return f"Data saved to {filename}"

def parse_location(location_input: str) -> Dict[str, float]:
    """Parse location input (coordinates or English names) to lat/lng coordinates."""
    location_input = location_input.strip().lower()
    
    # First, try to parse as coordinates
    try:
        # Handle formats like "-33.871, 151.206" or "lat: -33.871, lng: 151.206"
        import re
        coord_pattern = r'-?\d+\.?\d*'
        coords = re.findall(coord_pattern, location_input)
        if len(coords) >= 2:
            lat = float(coords[0])
            lng = float(coords[1])
            return {"lat": lat, "lng": lng}
    except (ValueError, IndexError):
        pass
    
    # Load stores data to match against actual store locations
    stores_data = load_json_data("stores.json")
    
    # Build location map from actual stores data
    location_map = {}
    for store in stores_data.get("stores", []):
        suburb = store.get("suburb", "").lower()
        name = store.get("name", "").lower()
        location = store.get("location", {})
        
        if suburb and location:
            location_map[suburb] = location
        
        # Add store name variations
        if "woolworths" in name:
            if "town hall" in name:
                location_map["sydney cbd"] = location
                location_map["sydney"] = location
                location_map["sydney central"] = location
                location_map["town hall"] = location
            elif "bondi junction" in name:
                location_map["bondi junction"] = location
                location_map["bondi"] = location
            elif "pyrmont" in name:
                location_map["pyrmont"] = location
            elif "newtown" in name:
                location_map["newtown"] = location
            elif "double bay" in name:
                location_map["double bay"] = location
        
        elif "coles" in name:
            if "central" in name:
                location_map["sydney cbd"] = location
                location_map["sydney central"] = location
            elif "bondi junction" in name:
                location_map["bondi junction"] = location
                location_map["bondi"] = location
            elif "darlinghurst" in name:
                location_map["darlinghurst"] = location
            elif "surry hills" in name:
                location_map["surry hills"] = location
            elif "glebe" in name:
                location_map["glebe"] = location
        
        elif "aldi" in name:
            if "sydney central" in name:
                location_map["sydney cbd"] = location
                location_map["sydney central"] = location
            elif "alexandria" in name:
                location_map["alexandria"] = location
            elif "waterloo" in name:
                location_map["waterloo"] = location
            elif "leichhardt" in name:
                location_map["leichhardt"] = location
            elif "mascot" in name:
                location_map["mascot"] = location
    
    # Try exact match first
    if location_input in location_map:
        return location_map[location_input]
    
    # Try partial matches
    for known_location, coords in location_map.items():
        if location_input in known_location or known_location in location_input:
            return coords
    
    # Default to Sydney CBD (Woolworths Town Hall coordinates)
    return {"lat": -33.871, "lng": 151.206}

# Core Agent Tools
def fetch_prices(items: List[str], stores: List[str], location: Dict[str, float]) -> str:
    """Fetch prices for items across specified stores."""
    products_data = load_json_data("products.json")
    catalog_data = load_json_data("retailer_catalog.json")
    prices_data = load_json_data("price_snapshots.json")
    
    results = []
    for item in items:
        # Find canonical product
        canonical_id = None
        for product in products_data.get("products", []):
            if item.lower() in [alias.lower() for alias in product["aliases"]]:
                canonical_id = product["canonical_id"]
                break
        
        if not canonical_id:
            results.append(f"Item '{item}' not found in product catalog")
            continue
            
        # Find retailer products and prices
        item_prices = []
        for catalog_item in catalog_data.get("retailer_products", []):
            if catalog_item["canonical_id"] == canonical_id:
                for price_item in prices_data.get("prices", []):
                    if price_item["retailer_product_id"] == catalog_item["retailer_product_id"]:
                        item_prices.append({
                            "retailer": catalog_item["retailer_id"],
                            "product_name": catalog_item["name"],
                            "price": price_item["price"]
                        })
        
        results.append(f"Item: {item} -> {item_prices}")
    
    return "\n".join(results)

def store_locator(retailer: str, location: Dict[str, float]) -> str:
    """Find stores for a retailer near the given location."""
    stores_data = load_json_data("stores.json")
    user_lat = location.get("lat", 0)
    user_lng = location.get("lng", 0)
    
    nearby_stores = []
    for store in stores_data.get("stores", []):
        if store["retailer_id"] == retailer:
            store_lat = store["location"]["lat"]
            store_lng = store["location"]["lng"]
            
            # Calculate distance (simplified)
            distance = math.sqrt((user_lat - store_lat)**2 + (user_lng - store_lng)**2)
            
            nearby_stores.append({
                "store_id": store["store_id"],
                "name": store["name"],
                "address": store["address"],
                "location": store["location"],
                "distance_approx": round(distance * 111, 2)  # Rough km conversion
            })
    
    return f"Found {len(nearby_stores)} {retailer} stores: {nearby_stores}"

def distance_matrix(origins: List[Dict[str, float]], destinations: List[Dict[str, float]], mode: str = "driving") -> str:
    """Calculate distances between origins and destinations."""
    distances = []
    for i, origin in enumerate(origins):
        for j, dest in enumerate(destinations):
            # Calculate Haversine distance
            lat1, lng1 = origin["lat"], origin["lng"]
            lat2, lng2 = dest["lat"], dest["lng"]
            
            # Simplified distance calculation
            distance_km = math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2) * 111
            travel_time_minutes = (distance_km / 30) * 60  # Assume 30 km/h average
            
            distances.append({
                "from": f"origin_{i}",
                "to": f"destination_{j}",
                "distance_km": round(distance_km, 2),
                "travel_time_minutes": round(travel_time_minutes, 1)
            })
    
    return f"Distance matrix: {distances}"

def clickcollect_rules(retailer: str) -> str:
    """Get Click & Collect rules for a retailer."""
    retailers_data = load_json_data("retailers.json")
    
    for retailer_info in retailers_data.get("retailers", []):
        if retailer_info["retailer_id"] == retailer:
            rules = retailer_info.get("click_collect", {})
            return f"Click & Collect rules for {retailer}: {rules}"
    
    return f"No Click & Collect rules found for {retailer}"

def cart_bridge(retailer: str, line_items: List[Dict]) -> str:
    """Bridge to retailer's cart system (mock implementation)."""
    total = sum(item.get("line_total", 0) for item in line_items)
    return f"Cart created for {retailer} with {len(line_items)} items, total: ${total:.2f}"

def persist_plan(plan_json: Dict) -> str:
    """Save the generated plan to the plans database."""
    plans_data = load_json_data("plans.json")
    
    # Generate plan ID
    plan_id = f"plan_{len(plans_data.get('plans', [])) + 1:06d}"
    
    plan_entry = {
        "plan_id": plan_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "payload": plan_json
    }
    
    if "plans" not in plans_data:
        plans_data["plans"] = []
    
    plans_data["plans"].append(plan_entry)
    save_json_data("plans.json", plans_data)
    
    return f"Plan saved with ID: {plan_id}"

def log_event(event: str) -> str:
    """Log an event for debugging and tracking."""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = f"[{timestamp}] {event}"
    print(log_entry)  # Simple console logging
    return f"Event logged: {event}"

def validate_store_names(store_names: List[str]) -> str:
    """Validate that store names exist in the mock data."""
    stores_data = load_json_data("stores.json")
    valid_stores = []
    invalid_stores = []
    
    for store_name in store_names:
        found = False
        for store in stores_data.get("stores", []):
            if store_name.lower() in store["name"].lower() or store["name"].lower() in store_name.lower():
                valid_stores.append(store["name"])
                found = True
                break
        
        if not found:
            invalid_stores.append(store_name)
    
    result = f"Valid stores: {valid_stores}"
    if invalid_stores:
        result += f"\nINVALID stores (not in mock data): {invalid_stores}"
        result += "\nAvailable stores: Woolworths (Town Hall, Bondi Junction, Pyrmont, Newtown, Double Bay), Coles (Central, Bondi Junction, Darlinghurst, Surry Hills, Glebe), ALDI (Sydney Central, Alexandria, Waterloo, Leichhardt, Mascot)"
    
    return result

def get_available_stores() -> str:
    """Get the complete list of available stores from the mock data."""
    stores_data = load_json_data("stores.json")
    
    stores_by_retailer = {
        "Woolworths": [],
        "Coles": [],
        "ALDI": []
    }
    
    for store in stores_data.get("stores", []):
        retailer_id = store["retailer_id"]
        # Map retailer IDs to proper display names
        if retailer_id == "woolworths":
            retailer = "Woolworths"
        elif retailer_id == "coles":
            retailer = "Coles"
        elif retailer_id == "aldi":
            retailer = "ALDI"
        else:
            retailer = retailer_id.title()
        
        store_name = store["name"]
        stores_by_retailer[retailer].append(store_name)
    
    result = "Available stores in mock data:\n"
    for retailer, stores in stores_by_retailer.items():
        result += f"- {retailer}: {', '.join(stores)}\n"
    
    result += "\nIMPORTANT: You must ONLY use these exact store names. Do not invent or modify store names."
    
    return result

# Core Planning Functions
def normalize_shopping_list(raw_items: List[str]) -> List[Dict[str, Any]]:
    """Convert raw shopping list text into canonical items."""
    products_data = load_json_data("products.json")
    normalized_items = []
    
    for raw_item in raw_items:
        item_lower = raw_item.lower().strip()
        
        # Find matching canonical product
        for product in products_data.get("products", []):
            if item_lower in [alias.lower() for alias in product["aliases"]]:
                normalized_items.append({
                    "canonical_id": product["canonical_id"],
                    "canonical_name": product["canonical_name"],
                    "requested_item": raw_item,
                    "quantity": 1  # Default quantity, could be parsed from input
                })
                break
        else:
            # Item not found, create a placeholder
            normalized_items.append({
                "canonical_id": None,
                "canonical_name": raw_item,
                "requested_item": raw_item,
                "quantity": 1
            })
    
    return normalized_items

def match_candidates(canonical_id: str, retailer_id: str) -> List[Dict[str, Any]]:
    """Find product candidates for a given canonical item and retailer."""
    catalog_data = load_json_data("retailer_catalog.json")
    prices_data = load_json_data("price_snapshots.json")
    
    candidates = []
    for catalog_item in catalog_data.get("retailer_products", []):
        if (catalog_item["canonical_id"] == canonical_id and 
            catalog_item["retailer_id"] == retailer_id):
            
            # Find price
            price = None
            for price_item in prices_data.get("prices", []):
                if price_item["retailer_product_id"] == catalog_item["retailer_product_id"]:
                    price = price_item["price"]
                    break
            
            candidates.append({
                "retailer_product_id": catalog_item["retailer_product_id"],
                "name": catalog_item["name"],
                "price": price,
                "retailer_id": retailer_id
            })
    
    return candidates

def build_initial_assignment(
    shopping_list: List[Dict[str, Any]],
    candidate_stores: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Initial allocation of each item to the best store."""
    assignment = {
        "stores": {},
        "items": {},
        "total_cost": 0.0,
        "total_time": 0.0
    }
    
    # Initialize store baskets
    for store in candidate_stores:
        assignment["stores"][store["retailer_id"]] = {
            "store_info": store,
            "items": [],
            "subtotal": 0.0,
            "instore_time": 0.0
        }
    
    # Assign each item to the cheapest store
    for item in shopping_list:
        if not item["canonical_id"]:
            continue
            
        best_store = None
        best_price = float('inf')
        best_candidate = None
        
        # Find cheapest option across all stores
        for store in candidate_stores:
            candidates = match_candidates(item["canonical_id"], store["retailer_id"])
            for candidate in candidates:
                if candidate["price"] and candidate["price"] < best_price:
                    best_price = candidate["price"]
                    best_store = store["retailer_id"]
                    best_candidate = candidate
        
        if best_store and best_candidate:
            line_total = best_price * item["quantity"]
            
            assignment["stores"][best_store]["items"].append({
                "item_requested": item["requested_item"],
                "matched_product": best_candidate["name"],
                "qty": item["quantity"],
                "unit_price": best_price,
                "line_total": line_total,
                "substitution": False
            })
            
            assignment["stores"][best_store]["subtotal"] += line_total
            assignment["stores"][best_store]["instore_time"] += 2.0  # 2 min per item
            
            assignment["items"][item["canonical_id"]] = {
                "store": best_store,
                "candidate": best_candidate
            }
            
            assignment["total_cost"] += line_total
    
    return assignment

def apply_max_store_cap(
    assignment: Dict[str, Any],
    max_stores: int
) -> Dict[str, Any]:
    """Limit number of stores in route."""
    stores_with_items = [store_id for store_id, store_data in assignment["stores"].items() 
                        if store_data["items"]]
    
    if len(stores_with_items) <= max_stores:
        return assignment
    
    # Sort stores by subtotal (keep highest spending stores)
    stores_by_subtotal = sorted(stores_with_items, 
                               key=lambda x: assignment["stores"][x]["subtotal"], 
                               reverse=True)
    
    # Keep only top stores
    stores_to_keep = stores_by_subtotal[:max_stores]
    stores_to_remove = stores_by_subtotal[max_stores:]
    
    # Reassign items from removed stores to kept stores
    for store_id in stores_to_remove:
        store_data = assignment["stores"][store_id]
        for item in store_data["items"]:
            # Find cheapest alternative in kept stores
            best_store = None
            best_price = float('inf')
            
            for keep_store in stores_to_keep:
                candidates = match_candidates(item.get("canonical_id", ""), keep_store)
                for candidate in candidates:
                    if candidate["price"] and candidate["price"] < best_price:
                        best_price = candidate["price"]
                        best_store = keep_store
            
            if best_store:
                # Move item to best store
                assignment["stores"][best_store]["items"].append(item)
                assignment["stores"][best_store]["subtotal"] += item["line_total"]
                assignment["stores"][best_store]["instore_time"] += 2.0
        
        # Clear removed store
        assignment["stores"][store_id] = {
            "store_info": store_data["store_info"],
            "items": [],
            "subtotal": 0.0,
            "instore_time": 0.0
        }
    
    return assignment

def rebalance_for_min_spend(
    assignment: Dict[str, Any],
    rules: Dict[str, Any]
) -> Dict[str, Any]:
    """Reassign items to meet min-spend thresholds while optimising weighted score."""
    for retailer_id, store_data in assignment["stores"].items():
        if not store_data["items"]:
            continue
            
        min_spend = rules.get(retailer_id, {}).get("min_spend", 0)
        current_spend = store_data["subtotal"]
        
        if current_spend < min_spend:
            # Try to move items from other stores to meet min spend
            deficit = min_spend - current_spend
            
            # Find items from other stores that could help
            for other_store_id, other_data in assignment["stores"].items():
                if other_store_id == retailer_id or not other_data["items"]:
                    continue
                
                # Look for items that would help reach min spend
                for item in other_data["items"][:]:  # Copy to avoid modification during iteration
                    if other_data["subtotal"] - item["line_total"] >= 0:  # Don't make other store empty
                        # Check if moving this item helps
                        new_total = current_spend + item["line_total"]
                        if new_total >= min_spend:
                            # Move the item
                            other_data["items"].remove(item)
                            other_data["subtotal"] -= item["line_total"]
                            other_data["instore_time"] -= 2.0
                            
                            store_data["items"].append(item)
                            store_data["subtotal"] += item["line_total"]
                            store_data["instore_time"] += 2.0
                            
                            current_spend = new_total
                            break
                
                if current_spend >= min_spend:
                    break
    
    return assignment

def tsp_order(
    stores: List[Dict[str, Any]],
    travel_matrix: List[List[float]]
) -> List[Dict[str, Any]]:
    """Compute optimal store visit order using nearest neighbor heuristic."""
    if not stores:
        return []
    
    # Simple nearest neighbor TSP
    route = [stores[0]]  # Start with first store
    unvisited = stores[1:]
    
    while unvisited:
        current_store = route[-1]
        nearest_store = None
        nearest_distance = float('inf')
        
        for store in unvisited:
            # Find distance in matrix (simplified lookup)
            distance = 5.0  # Default distance if not in matrix
            if len(travel_matrix) > 0:
                # Simplified: use first distance value as approximation
                distance = travel_matrix[0][0] if travel_matrix[0] else 5.0
            
            if distance < nearest_distance:
                nearest_distance = distance
                nearest_store = store
        
        if nearest_store:
            route.append(nearest_store)
            unvisited.remove(nearest_store)
    
    return route

def score_plan(
    baskets: Dict[str, Any],
    route: List[Dict[str, Any]],
    weights: Dict[str, float]
) -> float:
    """Compute weighted score for a plan (lower is better)."""
    total_cost = sum(store_data["subtotal"] for store_data in baskets.values())
    
    # Estimate travel time (simplified)
    travel_time = len(route) * 10.0  # 10 minutes per store
    
    # Estimate in-store time
    instore_time = sum(store_data["instore_time"] for store_data in baskets.values())
    
    total_time = travel_time + instore_time
    
    # Weighted score (cost in dollars, time in minutes)
    cost_weight = weights.get("cost", 0.8)
    time_weight = weights.get("time", 0.2)
    
    # Normalize and combine
    normalized_cost = total_cost / 100.0  # Normalize to roughly same scale
    normalized_time = total_time / 60.0   # Convert to hours
    
    score = (cost_weight * normalized_cost) + (time_weight * normalized_time)
    return score

# Additional Helper Functions
def compute_unit_price(price: float, unit_size: str) -> float:
    """Normalize unit prices across different pack sizes."""
    # Simplified normalization - in reality would parse unit_size
    return round(price, 4)

def candidate_stores(retailers: List[str], user_loc: Dict[str, float]) -> List[Dict[str, Any]]:
    """Get candidate stores for the given retailers near user location."""
    stores_data = load_json_data("stores.json")
    candidates = []
    
    for store in stores_data.get("stores", []):
        if store["retailer_id"] in retailers:
            # Calculate distance
            store_lat = store["location"]["lat"]
            store_lng = store["location"]["lng"]
            user_lat = user_loc.get("lat", 0)
            user_lng = user_loc.get("lng", 0)
            
            distance = math.sqrt((user_lat - store_lat)**2 + (user_lng - store_lng)**2)
            
            candidates.append({
                "store_id": store["store_id"],
                "retailer_id": store["retailer_id"],
                "name": store["name"],
                "address": store["address"],
                "location": store["location"],
                "distance_km": round(distance * 111, 2)
            })
    
    return candidates

def estimate_instore_time(num_items: int, mode: str = "standard") -> float:
    """Estimate time spent in store based on number of items."""
    base_time = 2.0  # minutes per item
    if mode == "click_collect":
        base_time = 0.5  # Much faster for pickup
    elif mode == "browse":
        base_time = 3.0  # Slower for browsing
    
    return num_items * base_time

def compute_single_store_baseline(
    shopping_list: List[Dict[str, Any]],
    store_id: str
) -> float:
    """Compute cost if all items were bought from a single store."""
    total_cost = 0.0
    
    for item in shopping_list:
        if not item["canonical_id"]:
            continue
            
        candidates = match_candidates(item["canonical_id"], store_id)
        if candidates and candidates[0]["price"]:
            total_cost += candidates[0]["price"] * item["quantity"]
    
    return round(total_cost, 2)

def compute_totals(assignment: Dict[str, Any]) -> Dict[str, Any]:
    """Compute final totals for the plan."""
    total_cost = sum(store_data["subtotal"] for store_data in assignment["stores"].values())
    total_instore_time = sum(store_data["instore_time"] for store_data in assignment["stores"].values())
    
    # Estimate travel time
    stores_with_items = [store_id for store_id, store_data in assignment["stores"].items() 
                        if store_data["items"]]
    travel_time = len(stores_with_items) * 10.0  # 10 min per store
    
    return {
        "grand_subtotal": round(total_cost, 2),
        "travel_minutes_total": round(travel_time, 1),
        "instore_minutes_total": round(total_instore_time, 1),
        "time_minutes_total": round(travel_time + total_instore_time, 1)
    }

def flag_substitutions(assignment: Dict[str, Any]) -> Dict[str, Any]:
    """Flag any substitutions in the assignment."""
    # This would be more sophisticated in reality
    # For now, just return the assignment as-is
    return assignment

def collect_assumptions_and_warnings(
    shopping_list: List[Dict[str, Any]],
    assignment: Dict[str, Any]
) -> Dict[str, List[str]]:
    """Collect assumptions and warnings for the plan."""
    assumptions = []
    warnings = []
    
    # Check for unmatched items
    unmatched_items = [item["requested_item"] for item in shopping_list 
                      if not item["canonical_id"]]
    if unmatched_items:
        warnings.append(f"Items not found in catalog: {', '.join(unmatched_items)}")
    
    # Check for empty stores
    empty_stores = [store_id for store_id, store_data in assignment["stores"].items() 
                   if not store_data["items"]]
    if empty_stores:
        assumptions.append(f"Stores with no items: {', '.join(empty_stores)}")
    
    # Default assumptions
    assumptions.extend([
        "Prices based on mock data - not real-time",
        "Travel times estimated at 30 km/h average speed",
        "In-store time estimated at 2 minutes per item",
        "Click & Collect eligibility based on minimum spend rules"
    ])
    
    return {"assumptions": assumptions, "warnings": warnings}

def assemble_plan_json(
    assignment: Dict[str, Any],
    route: List[Dict[str, Any]],
    totals: Dict[str, Any],
    assumptions_warnings: Dict[str, List[str]],
    baseline_cost: float
) -> Dict[str, Any]:
    """Assemble the final Plan_v1 JSON structure."""
    
    # Build route structure
    route_data = []
    for i, store in enumerate(route):
        store_data = assignment["stores"][store["retailer_id"]]
        
        # Check Click & Collect eligibility
        retailers_data = load_json_data("retailers.json")
        min_spend = 0
        for retailer in retailers_data.get("retailers", []):
            if retailer["retailer_id"] == store["retailer_id"]:
                min_spend = retailer.get("click_collect", {}).get("min_spend", 0)
                break
        
        meets_min_spend = store_data["subtotal"] >= min_spend
        
        route_data.append({
            "retailer": store["name"],
            "store_id": store["store_id"],
            "eta_travel_minutes": 0 if i == 0 else 10.0,
            "eta_instore_minutes": store_data["instore_time"],
            "click_and_collect": {
                "eligible": True,
                "meets_min_spend": meets_min_spend,
                "button_enabled": meets_min_spend,
                "reason_if_disabled": f"Below min spend (${min_spend})" if not meets_min_spend else None
            },
            "basket": store_data["items"],
            "store_subtotal": store_data["subtotal"]
        })
    
    # Calculate savings
    total_savings = max(0, baseline_cost - totals["grand_subtotal"])
    
    plan_json = {
        "meta": {
            "version": "1.0",
            "currency": "AUD",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "assumptions": assumptions_warnings["assumptions"],
            "warnings": assumptions_warnings["warnings"]
        },
        "route": route_data,
        "totals": {
            "items_requested": len([item for item in assignment.get("items", {}).values() if item]),
            "items_matched": len([item for item in assignment.get("items", {}).values() if item]),
            "items_unmatched": [item["requested_item"] for item in assignment.get("items", {}).values() if not item.get("canonical_id")],
            "grand_subtotal": totals["grand_subtotal"],
            "travel_minutes_total": totals["travel_minutes_total"],
            "instore_minutes_total": totals["instore_minutes_total"],
            "time_minutes_total": totals["time_minutes_total"],
            "baseline_single_store_cost": baseline_cost,
            "total_savings": round(total_savings, 2)
        },
        "actions": [
            {
                "retailer": store["name"],
                "action": "create_click_and_collect_cart",
                "enabled": store_data["subtotal"] >= min_spend
            }
            for store, store_data in zip(route, [assignment["stores"][s["retailer_id"]] for s in route])
        ]
    }
    
    return plan_json

def render_human_summary(plan: Dict[str, Any]) -> str:
    """Render a human-readable summary of the plan."""
    totals = plan["totals"]
    
    summary = f"""# 🛒 ShopLyft Shopping Plan

## 💰 Total Savings: ${totals['total_savings']:.2f}
*Compared to shopping at a single store: ${totals['baseline_single_store_cost']:.2f} → ${totals['grand_subtotal']:.2f}*

## 🛍️ Shopping Route ({len(plan['route'])} stores)
"""
    
    for i, store_visit in enumerate(plan["route"], 1):
        store_name = store_visit["retailer"]
        subtotal = store_visit["store_subtotal"]
        items = len(store_visit["basket"])
        cc_status = "✅ Click & Collect" if store_visit["click_and_collect"]["meets_min_spend"] else "❌ In-store shopping"
        
        summary += f"""
### {i}. {store_name}
- **Items:** {items} items
- **Subtotal:** ${subtotal:.2f}
- **Collection:** {cc_status}
- **Items:**
"""
        for item in store_visit["basket"]:
            summary += f"  - {item['matched_product']} (${item['unit_price']:.2f})\n"
    
    summary += f"""
## ⏱️ Time Summary
- **Total Time:** {totals['time_minutes_total']:.1f} minutes
- **Travel Time:** {totals['travel_minutes_total']:.1f} minutes
- **Shopping Time:** {totals['instore_minutes_total']:.1f} minutes

## 📋 Plan Details
- **Items Requested:** {totals['items_requested']}
- **Items Found:** {totals['items_matched']}
- **Items Not Found:** {len(totals['items_unmatched'])}
"""
    
    if plan["meta"]["warnings"]:
        summary += "\n## ⚠️ Warnings\n"
        for warning in plan["meta"]["warnings"]:
            summary += f"- {warning}\n"
    
    return summary

# Create the ShopLyft Agent
agent = Agent(
    name="shoplyft_agent",
    system_prompt="prompt.md",  # Load from markdown file
    model="co/o4-mini",  # Use ConnectOnion model
    tools=[
        # Location parsing
        parse_location,
        # Core data tools
        fetch_prices,
        store_locator, 
        distance_matrix,
        clickcollect_rules,
        cart_bridge,
        persist_plan,
        log_event,
        # Data validation
        validate_store_names,
        get_available_stores,
        # Core planning functions
        normalize_shopping_list,
        match_candidates,
        build_initial_assignment,
        apply_max_store_cap,
        rebalance_for_min_spend,
        tsp_order,
        score_plan,
        # Additional helper functions
        compute_unit_price,
        candidate_stores,
        estimate_instore_time,
        compute_single_store_baseline,
        compute_totals,
        flag_substitutions,
        collect_assumptions_and_warnings,
        assemble_plan_json,
        render_human_summary
    ],
    max_iterations=16
)

if __name__ == "__main__":
    print("🛒 ShopLyft AI Agent Ready!")
    print("Enter a shopping list and location to get an optimized grocery plan.")
    print("Example: 'Shopping list: milk, bread, eggs. Location: Sydney CBD'")
    print("Type 'quit' to exit.\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break
        
        try:
            response = agent.input(user_input)
            print(f"\nAgent: {response}\n")
        except Exception as e:
            print(f"Error: {e}\n")
