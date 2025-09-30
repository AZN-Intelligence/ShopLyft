# ShopLyft AI Agent - Grocery Shopping Optimization
# New Architecture: AI parsing → Route chooser → Optimization → Action plan

import json
import math
import itertools
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from connectonion import Agent, llm_do
from pydantic import BaseModel

# Data loading functions
def load_json_data(filename: str) -> Dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def get_available_stores() -> str:
    """Get the complete list of available stores from the JSON data files."""
    stores_data = load_json_data("stores.json")
    
    stores_by_retailer = {}
    for store in stores_data.get("stores", []):
        retailer_id = store["retailer_id"]
        if retailer_id not in stores_by_retailer:
            stores_by_retailer[retailer_id] = []
        stores_by_retailer[retailer_id].append(store["name"])
    
    result = "Available stores in JSON data:\n"
    for retailer, stores in stores_by_retailer.items():
        result += f"- {retailer.title()}: {', '.join(stores)}\n"
    
    result += "\nIMPORTANT: Only these exact stores can be used. No other stores exist in the data."
    
    return result

def validate_stores_only_from_data(stores: List[Dict[str, Any]]) -> bool:
    """Validate that all stores come from the JSON data files."""
    stores_data = load_json_data("stores.json")
    valid_store_ids = {store["store_id"] for store in stores_data.get("stores", [])}
    
    for store in stores:
        if store.get("store_id") not in valid_store_ids:
            return False
    
    return True


def parse_location(location_input: str) -> Dict[str, float]:
    """Parse location input to lat/lng coordinates using ONLY stores from stores.json."""
    location_input = location_input.strip().lower()
    
    # First, try to parse as coordinates
    try:
        import re
        coord_pattern = r'-?\d+\.?\d*'
        coords = re.findall(coord_pattern, location_input)
        if len(coords) >= 2:
            lat = float(coords[0])
            lng = float(coords[1])
            return {"lat": lat, "lng": lng}
    except (ValueError, IndexError):
        pass
    
    # Load stores data - ONLY use stores from JSON data
    stores_data = load_json_data("stores.json")
    
    # Build location map from actual stores data ONLY
    location_map = {}
    for store in stores_data.get("stores", []):
        suburb = store.get("suburb", "").lower()
        name = store.get("name", "").lower()
        location = store.get("location", {})
        
        if suburb and location:
            location_map[suburb] = location
        
        # Add store name variations for common locations
        if "town hall" in name or "central" in name:
            location_map["sydney cbd"] = location
            location_map["sydney"] = location
            location_map["sydney central"] = location
            location_map["town hall"] = location
            location_map["central"] = location
        elif "bondi junction" in name:
            location_map["bondi junction"] = location
            location_map["bondi"] = location
        elif "pyrmont" in name:
            location_map["pyrmont"] = location
        elif "newtown" in name:
            location_map["newtown"] = location
        elif "double bay" in name:
            location_map["double bay"] = location
        elif "darlinghurst" in name:
            location_map["darlinghurst"] = location
        elif "surry hills" in name:
            location_map["surry hills"] = location
        elif "glebe" in name:
            location_map["glebe"] = location
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
    
    # Default to Sydney CBD (Woolworths Town Hall coordinates) - this is from stores.json
    return {"lat": -33.871, "lng": 151.206}

# Pydantic models for structured LLM output
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

def validate_products_only_from_data(parsed_products: List[ParsedProduct]) -> bool:
    """Validate that all parsed products use canonical_ids from products.json."""
    products_data = load_json_data("products.json")
    valid_canonical_ids = {product["canonical_id"] for product in products_data.get("products", [])}
    
    for product in parsed_products:
        if product.canonical_id not in valid_canonical_ids:
            return False
    
    return True

# STEP 1: AI Parser - Parse grocery list into products.json items
def parse_grocery_list_to_products(raw_grocery_list: str) -> str:
    """Use AI to parse natural language grocery list into products.json items ONLY."""
    products_data = load_json_data("products.json")
    
    # Build product catalog context for AI - ONLY from products.json
    catalog_context = "ONLY use these pre-existing products from the catalog:\n"
    for product in products_data.get("products", []):
        catalog_context += f"- {product['canonical_id']}: {product['canonical_name']} (aliases: {', '.join(product['aliases'])})\n"
    
    # Use AI to parse items with strict constraints
    parsed_list = llm_do(
        f"""
        Parse this grocery list into the product catalog:
        
        Grocery list: "{raw_grocery_list}"
        
        {catalog_context}
        
        CRITICAL RULES:
        1. ONLY match items to canonical_id values that exist in the catalog above
        2. Do NOT create new products or canonical_ids
        3. Extract quantity if mentioned (default to 1)
        4. Assign confidence score (0.0-1.0) based on match quality
        5. List unmatched items separately - items that don't match any catalog entry
        6. Be VERY conservative - only parse items you're confident match existing products
        7. If an item doesn't clearly match a catalog entry, put it in unmatched_items
        
        Return structured parsing with canonical_id, canonical_name, requested_item, quantity, and confidence.
        """,
        output=ParsedShoppingList,
        temperature=0.1
    )
    
    return f"Parsed {len(parsed_list.parsed_products)} items, {len(parsed_list.unmatched_items)} unmatched. Confidence: {parsed_list.parsing_confidence:.2f}"

# STEP 2: Route Chooser - Multi-part optimization system

# Part 1: Generate dataset of (item, price, store) for all items
def generate_price_dataset(parsed_products: List[ParsedProduct]) -> List[Dict[str, Any]]:
    """Generate dataset of (item, price, store) for every item in the list."""
    catalog_data = load_json_data("retailer_catalog.json")
    prices_data = load_json_data("price_snapshots.json")
    stores_data = load_json_data("stores.json")
    
    # Build price lookup
    price_lookup = {}
    for price_item in prices_data.get("prices", []):
        price_lookup[price_item["retailer_product_id"]] = price_item["price"]
    
    # Build store lookup - group stores by retailer_id
    stores_by_retailer = {}
    for store in stores_data.get("stores", []):
        retailer_id = store["retailer_id"]
        if retailer_id not in stores_by_retailer:
            stores_by_retailer[retailer_id] = []
        stores_by_retailer[retailer_id].append(store)
    
    dataset = []
    
    for product in parsed_products:
        # Find all retailer products for this canonical item
        for catalog_item in catalog_data.get("retailer_products", []):
            if catalog_item["canonical_id"] == product.canonical_id:
                retailer_id = catalog_item["retailer_id"]
                retailer_product_id = catalog_item["retailer_product_id"]
                
                # Check if we have price data for this product
                if retailer_product_id in price_lookup and retailer_id in stores_by_retailer:
                    price = price_lookup[retailer_product_id]
                    
                    # Add entry for each store of this retailer
                    for store_info in stores_by_retailer[retailer_id]:
                        dataset.append({
                            "canonical_id": product.canonical_id,
                            "canonical_name": product.canonical_name,
                            "requested_item": product.requested_item,
                            "quantity": product.quantity,
                            "retailer_id": retailer_id,
                            "retailer_product_id": retailer_product_id,
                            "product_name": catalog_item["name"],
                            "price": price,
                            "store_info": store_info
                        })
    
    return dataset

# Part 2: Generate all possible routes for all stores considered
def generate_all_possible_routes(
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    max_stores: int = 3
) -> List[Dict[str, Any]]:
    """Generate every possible route for all stores considered."""
    
    # Get unique stores from dataset - only use stores that exist in JSON data
    stores = {}
    for item in price_dataset:
        store_info = item["store_info"]
        store_id = store_info["store_id"]
        
        # Only include stores that are in the JSON data
        if store_id not in stores:
            stores[store_id] = store_info
    
    store_list = list(stores.values())
    
    # Validate all stores come from JSON data
    if not validate_stores_only_from_data(store_list):
        raise ValueError("Invalid stores detected - all stores must come from JSON data files")
    
    # Generate all possible combinations of stores (1 to max_stores)
    all_routes = []
    
    for num_stores in range(1, min(len(store_list) + 1, max_stores + 1)):
        for store_combination in itertools.combinations(store_list, num_stores):
            # Generate all permutations of this combination
            for store_permutation in itertools.permutations(store_combination):
                route = list(store_permutation)
                all_routes.append({
                    "stores": route,
                    "num_stores": len(route)
                })
    
    return all_routes

# Part 3: Score each route based on time (20%) and price (80%)
def score_route(
    route: Dict[str, Any], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]:
    """Score a route based on time (20%) and price (80%)."""
    
    route_stores = route["stores"]
    
    # Calculate optimal item assignment for this route
    # Assign each item to the cheapest store in the route
    item_assignments = {}
    total_price = 0.0
    
    for item in price_dataset:
        best_store = None
        best_price = float('inf')
        
        for store in route_stores:
            if store["retailer_id"] == item["retailer_id"]:
                if item["price"] < best_price:
                    best_price = item["price"]
                    best_store = store
        
        if best_store:
            item_assignments[item["canonical_id"]] = {
                "store": best_store,
                "item": item,
                "total_price": item["price"] * item["quantity"]
            }
            total_price += item["price"] * item["quantity"]
    
    # Calculate travel time
    travel_time = calculate_travel_time(user_location, route_stores)
    
    # Calculate in-store time (2 minutes per item)
    in_store_time = len(item_assignments) * 2.0
    
    total_time = travel_time + in_store_time
    
    # Normalize scores for comparison
    # Assume max reasonable price is $100 and max reasonable time is 120 minutes
    normalized_price_score = total_price / 100.0
    normalized_time_score = total_time / 120.0
    
    # Calculate weighted score (lower is better)
    total_score = (price_weight * normalized_price_score) + (time_weight * normalized_time_score)
    
    return {
        "route": route,
        "item_assignments": item_assignments,
        "total_price": total_price,
        "travel_time": travel_time,
        "in_store_time": in_store_time,
        "total_time": total_time,
        "price_score": normalized_price_score,
        "time_score": normalized_time_score,
        "total_score": total_score,
        "num_items": len(item_assignments)
    }

def calculate_travel_time(user_location: Dict[str, float], route_stores: List[Dict[str, Any]]) -> float:
    """Calculate travel time for a route using Haversine distance."""
    if not route_stores:
        return 0.0
    
    total_time = 0.0
    current_location = user_location
    
    for store in route_stores:
        # Calculate distance using Haversine formula
        distance = haversine_distance(
            current_location["lat"], current_location["lng"],
            store["location"]["lat"], store["location"]["lng"]
        )
        
        # Convert distance to time (assume 30 km/h average speed)
        travel_time = (distance / 30.0) * 60.0  # Convert to minutes
        total_time += travel_time
        
        # Update current location
        current_location = store["location"]
    
    return total_time

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate Haversine distance between two points in km."""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)
    
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

# Part 4: Find optimal route (route with best score)
def find_optimal_route(
    all_routes: List[Dict[str, Any]], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]:
    """Find the route with the best score."""
    
    scored_routes = []
    
    for route in all_routes:
        scored_route = score_route(route, price_dataset, user_location, time_weight, price_weight)
        scored_routes.append(scored_route)
    
    # Sort by total score (lower is better)
    scored_routes.sort(key=lambda x: x["total_score"])
    
    return scored_routes[0] if scored_routes else None

# STEP 3: Display optimal route as action plan
def generate_action_plan(optimal_route: Dict[str, Any], user_location: Dict[str, float]) -> str:
    """Display the optimal route as an action plan."""
    
    if not optimal_route:
        return "No optimal route found."
    
    route_stores = optimal_route["route"]["stores"]
    item_assignments = optimal_route["item_assignments"]
    
    # Group items by store
    store_baskets = {}
    for canonical_id, assignment in item_assignments.items():
        store = assignment["store"]
        retailer_id = store["retailer_id"]
        
        if retailer_id not in store_baskets:
            store_baskets[retailer_id] = {
                "store_info": store,
                "items": [],
                "subtotal": 0.0
            }
        
        item = assignment["item"]
        line_total = item["price"] * item["quantity"]
        
        store_baskets[retailer_id]["items"].append({
            "item_requested": item["requested_item"],
            "product_name": item["product_name"],
            "quantity": item["quantity"],
            "unit_price": item["price"],
            "line_total": line_total
        })
        
        store_baskets[retailer_id]["subtotal"] += line_total
    
    # Generate action plan
    action_plan = f"""# 🛒 ShopLyft Optimal Shopping Plan

## 📊 Plan Summary
- **Total Cost:** ${optimal_route['total_price']:.2f}
- **Total Time:** {optimal_route['total_time']:.1f} minutes
- **Travel Time:** {optimal_route['travel_time']:.1f} minutes
- **Shopping Time:** {optimal_route['in_store_time']:.1f} minutes
- **Stores:** {len(route_stores)} stops

## 🗺️ Shopping Route
"""
    
    for i, store in enumerate(route_stores):
        retailer_id = store["retailer_id"]
        basket = store_baskets[retailer_id]
        
        # Check Click & Collect eligibility
        retailers_data = load_json_data("retailers.json")
        min_spend = 0
        for retailer in retailers_data.get("retailers", []):
            if retailer["retailer_id"] == retailer_id:
                min_spend = retailer.get("click_collect", {}).get("min_spend", 0)
                break
        
        meets_min_spend = basket["subtotal"] >= min_spend
        cc_status = "✅ Click & Collect" if meets_min_spend else f"❌ In-store (need ${min_spend - basket['subtotal']:.2f} more)"
        
        action_plan += f"""
### {i+1}. {store['name']}
- **Address:** {store['address']}
- **Items:** {len(basket['items'])} items
- **Subtotal:** ${basket['subtotal']:.2f}
- **Collection:** {cc_status}

**Shopping List:**
"""
        for item in basket["items"]:
            action_plan += f"- {item['product_name']} (Qty: {item['quantity']}) - ${item['unit_price']:.2f} each = ${item['line_total']:.2f}\n"
    
    action_plan += f"""
## 💡 Optimization Details
- **Route Score:** {optimal_route['total_score']:.4f}
- **Price Component:** {optimal_route['price_score']:.4f} (80% weight)
- **Time Component:** {optimal_route['time_score']:.4f} (20% weight)
- **Total Items:** {optimal_route['num_items']} items across {len(route_stores)} stores
"""
    
    return action_plan

# Main orchestrator function
def create_optimal_shopping_plan(
    raw_grocery_list: str,
    starting_location: str,
    max_stores: int = 3,
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> str:
    """Main function that orchestrates the entire shopping plan optimization."""
    
    # Step 1: Parse location
    user_location = parse_location(starting_location)
    
    # Step 2: AI parsing - Parse grocery list into products
    products_data = load_json_data("products.json")
    catalog_context = "ONLY use these pre-existing products from the catalog:\n"
    for product in products_data.get("products", []):
        catalog_context += f"- {product['canonical_id']}: {product['canonical_name']} (aliases: {', '.join(product['aliases'])})\n"
    
    parsed_list = llm_do(
        f"""
        Parse this grocery list into the product catalog:
        
        Grocery list: "{raw_grocery_list}"
        
        {catalog_context}
        
        CRITICAL RULES:
        1. ONLY match items to canonical_id values that exist in the catalog above
        2. Do NOT create new products or canonical_ids
        3. Extract quantity if mentioned (default to 1)
        4. Assign confidence score (0.0-1.0) based on match quality
        5. List unmatched items separately - items that don't match any catalog entry
        6. Be VERY conservative - only parse items you're confident match existing products
        7. If an item doesn't clearly match a catalog entry, put it in unmatched_items
        
        Return structured parsing with canonical_id, canonical_name, requested_item, quantity, and confidence.
        """,
        output=ParsedShoppingList,
        temperature=0.1
    )
    
    if not parsed_list.parsed_products:
        return "No items could be parsed from the grocery list."
    
    # Validate that all parsed products use canonical_ids from products.json
    if not validate_products_only_from_data(parsed_list.parsed_products):
        return "Error: Parsed products contain invalid canonical_ids not found in products.json"
    
    # Step 3: Route Chooser
    # Part 1: Generate price dataset
    price_dataset = generate_price_dataset(parsed_list.parsed_products)
    
    if not price_dataset:
        return "No price data found for the parsed items."
    
    # Part 2: Generate all possible routes
    all_routes = generate_all_possible_routes(price_dataset, user_location, max_stores)
    
    if not all_routes:
        return "No possible routes found."
    
    # Part 3: Score all routes
    # Part 4: Find optimal route
    optimal_route = find_optimal_route(all_routes, price_dataset, user_location, time_weight, price_weight)
    
    if not optimal_route:
        return "No optimal route found."
    
    # Step 4: Generate action plan
    action_plan = generate_action_plan(optimal_route, user_location)
    
    return action_plan

# Legacy functions for compatibility
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
    
    # Save to file
    data_path = Path(__file__).parent.parent / "data" / "plans.json"
    with open(data_path, 'w') as f:
        json.dump(plans_data, f, indent=2)
    
    return f"Plan saved with ID: {plan_id}"

def log_event(event: str) -> str:
    """Log an event for debugging and tracking."""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = f"[{timestamp}] {event}"
    print(log_entry)  # Simple console logging
    return f"Event logged: {event}"

# Create the ShopLyft Agent
agent = Agent(
    name="shoplyft_agent",
    system_prompt="prompt.md",
    model="co/o4-mini",
    tools=[
        # Main optimization function
        create_optimal_shopping_plan,
        # Individual components for debugging
        parse_grocery_list_to_products,
        generate_price_dataset,
        generate_all_possible_routes,
        score_route,
        find_optimal_route,
        generate_action_plan,
        # Utility functions
        parse_location,
        get_available_stores,
        validate_stores_only_from_data,
        validate_products_only_from_data,
        persist_plan,
        log_event
    ],
    max_iterations=8  # Reduced since main work is now in pure algorithms
)

if __name__ == "__main__":
    print("🛒 ShopLyft AI Agent Ready!")
    print("Enter a grocery list and starting location to get an optimized shopping plan.")
    print("Example: 'Grocery list: milk, bread, eggs. Starting location: Sydney CBD'")
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