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

# Create the ShopLyft Agent
agent = Agent(
    name="shoplyft_agent",
    system_prompt="prompt.md",  # Load from markdown file
    tools=[
        fetch_prices,
        store_locator, 
        distance_matrix,
        clickcollect_rules,
        cart_bridge,
        persist_plan,
        log_event
    ],
    max_iterations=16
)

if __name__ == "__main__":
    print("🛒 ShopLyft AI Agent Ready!")
    print("Enter a shopping list and location to get an optimized grocery plan.")
    print("Example: 'Shopping list: milk, bread, eggs. Location: -33.871, 151.206'")
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
