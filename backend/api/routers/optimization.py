# Optimization API Router
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
import json
import math
import itertools
from datetime import datetime, timezone
from pathlib import Path

from api.models import (
    OptimizationRequest, OptimizationResponse, ShoppingListRequest, ShoppingListResponse,
    ParsedProduct, ShoppingPlan, StoreBasket, RouteStore, RouteItem,
    ErrorResponse
)
from connectonion import llm_do
from pydantic import BaseModel

router = APIRouter()

def load_json_data(filename: str) -> dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent.parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Pydantic models for LLM output
class ParsedShoppingList(BaseModel):
    parsed_products: List[ParsedProduct]
    unmatched_items: List[str]
    parsing_confidence: float

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

def validate_products_only_from_data(parsed_products: List[ParsedProduct]) -> bool:
    """Validate that all parsed products use canonical_ids from products.json."""
    products_data = load_json_data("products.json")
    valid_canonical_ids = {product["canonical_id"] for product in products_data.get("products", [])}
    
    for product in parsed_products:
        if product.canonical_id not in valid_canonical_ids:
            return False
    
    return True

def validate_stores_only_from_data(stores: List[Dict[str, Any]]) -> bool:
    """Validate that all stores come from the JSON data files."""
    stores_data = load_json_data("stores.json")
    valid_store_ids = {store["store_id"] for store in stores_data.get("stores", [])}
    
    for store in stores:
        if store.get("store_id") not in valid_store_ids:
            return False
    
    return True

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

@router.post("/parse", response_model=ShoppingListResponse, summary="Parse shopping list")
async def parse_shopping_list(request: ShoppingListRequest):
    """Parse a natural language shopping list into structured products."""
    try:
        products_data = load_json_data("products.json")
        
        # Build product catalog context for AI - ONLY from products.json
        catalog_context = "ONLY use these pre-existing products from the catalog:\n"
        for product in products_data.get("products", []):
            catalog_context += f"- {product['canonical_id']}: {product['canonical_name']} (aliases: {', '.join(product['aliases'])})\n"
        
        # Use AI to parse items with strict constraints
        parsed_list = llm_do(
            f"""
            Parse this grocery list into the product catalog:
            
            Grocery list: "{request.grocery_list}"
            
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
        
        # Validate that all parsed products use canonical_ids from products.json
        if not validate_products_only_from_data(parsed_list.parsed_products):
            raise HTTPException(
                status_code=400,
                detail="Parsed products contain invalid canonical_ids not found in products.json"
            )
        
        return ShoppingListResponse(
            parsed_products=parsed_list.parsed_products,
            unmatched_items=parsed_list.unmatched_items,
            parsing_confidence=parsed_list.parsing_confidence
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse shopping list: {str(e)}"
        )

@router.post("/optimize", response_model=OptimizationResponse, summary="Generate optimized shopping plan")
async def optimize_shopping_plan(request: OptimizationRequest):
    """Generate an optimized shopping plan for the given grocery list and location."""
    try:
        # Step 1: Parse location
        user_location = parse_location(request.location)
        
        # Step 2: AI parsing - Parse grocery list into products
        products_data = load_json_data("products.json")
        catalog_context = "ONLY use these pre-existing products from the catalog:\n"
        for product in products_data.get("products", []):
            catalog_context += f"- {product['canonical_id']}: {product['canonical_name']} (aliases: {', '.join(product['aliases'])})\n"
        
        parsed_list = llm_do(
            f"""
            Parse this grocery list into the product catalog:
            
            Grocery list: "{request.grocery_list}"
            
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
            return OptimizationResponse(
                plan=ShoppingPlan(
                    total_cost=0.0,
                    total_time=0.0,
                    travel_time=0.0,
                    shopping_time=0.0,
                    num_stores=0,
                    route_score=0.0,
                    store_baskets=[]
                ),
                success=False,
                message="No items could be parsed from the grocery list."
            )
        
        # Validate that all parsed products use canonical_ids from products.json
        if not validate_products_only_from_data(parsed_list.parsed_products):
            return OptimizationResponse(
                plan=ShoppingPlan(
                    total_cost=0.0,
                    total_time=0.0,
                    travel_time=0.0,
                    shopping_time=0.0,
                    num_stores=0,
                    route_score=0.0,
                    store_baskets=[]
                ),
                success=False,
                message="Parsed products contain invalid canonical_ids not found in products.json"
            )
        
        # Step 3: Route Chooser
        # Part 1: Generate price dataset
        price_dataset = generate_price_dataset(parsed_list.parsed_products)
        
        if not price_dataset:
            return OptimizationResponse(
                plan=ShoppingPlan(
                    total_cost=0.0,
                    total_time=0.0,
                    travel_time=0.0,
                    shopping_time=0.0,
                    num_stores=0,
                    route_score=0.0,
                    store_baskets=[]
                ),
                success=False,
                message="No price data found for the parsed items."
            )
        
        # Part 2: Generate all possible routes
        all_routes = generate_all_possible_routes(price_dataset, user_location, request.max_stores)
        
        if not all_routes:
            return OptimizationResponse(
                plan=ShoppingPlan(
                    total_cost=0.0,
                    total_time=0.0,
                    travel_time=0.0,
                    shopping_time=0.0,
                    num_stores=0,
                    route_score=0.0,
                    store_baskets=[]
                ),
                success=False,
                message="No possible routes found."
            )
        
        # Part 3: Find optimal route
        optimal_route = find_optimal_route(all_routes, price_dataset, user_location, request.time_weight, request.price_weight)
        
        if not optimal_route:
            return OptimizationResponse(
                plan=ShoppingPlan(
                    total_cost=0.0,
                    total_time=0.0,
                    travel_time=0.0,
                    shopping_time=0.0,
                    num_stores=0,
                    route_score=0.0,
                    store_baskets=[]
                ),
                success=False,
                message="No optimal route found."
            )
        
        # Step 4: Generate shopping plan
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
        
        # Build store baskets with click & collect info
        retailers_data = load_json_data("retailers.json")
        basket_list = []
        
        for retailer_id, basket_data in store_baskets.items():
            store_info = basket_data["store_info"]
            
            # Check Click & Collect eligibility
            min_spend = 0
            for retailer in retailers_data.get("retailers", []):
                if retailer["retailer_id"] == retailer_id:
                    min_spend = retailer.get("click_collect", {}).get("min_spend", 0)
                    break
            
            meets_min_spend = basket_data["subtotal"] >= min_spend
            
            # Convert to RouteStore
            route_store = RouteStore(
                store_id=store_info["store_id"],
                retailer_id=store_info["retailer_id"],
                name=store_info["name"],
                address=store_info["address"],
                suburb=store_info["suburb"],
                postcode=store_info["postcode"],
                location=store_info["location"]
            )
            
            # Convert items to RouteItem
            route_items = []
            for item in basket_data["items"]:
                route_items.append(RouteItem(
                    item_requested=item["item_requested"],
                    product_name=item["product_name"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    line_total=item["line_total"]
                ))
            
            basket_list.append(StoreBasket(
                store_info=route_store,
                items=route_items,
                subtotal=basket_data["subtotal"],
                click_collect_eligible=meets_min_spend,
                min_spend_required=min_spend
            ))
        
        # Create shopping plan
        shopping_plan = ShoppingPlan(
            total_cost=optimal_route["total_price"],
            total_time=optimal_route["total_time"],
            travel_time=optimal_route["travel_time"],
            shopping_time=optimal_route["in_store_time"],
            num_stores=len(route_stores),
            route_score=optimal_route["total_score"],
            store_baskets=basket_list,
            generated_at=datetime.now(timezone.utc)
        )
        
        return OptimizationResponse(
            plan=shopping_plan,
            success=True,
            message=f"Optimized plan generated with {len(parsed_list.parsed_products)} items across {len(route_stores)} stores"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to optimize shopping plan: {str(e)}"
        )

@router.get("/status", summary="Get optimization service status")
async def get_optimization_status():
    """Get the current status of the optimization service."""
    try:
        # Check if all required data files are available
        required_files = ["products.json", "stores.json", "price_snapshots.json", "retailer_catalog.json", "retailers.json"]
        missing_files = []
        
        for filename in required_files:
            data_path = Path(__file__).parent.parent.parent / "data" / filename
            if not data_path.exists():
                missing_files.append(filename)
        
        # Check ConnectOnion availability
        try:
            # Simple test to see if ConnectOnion is available
            test_result = llm_do("Test", output=str, temperature=0.1)
            connectonion_available = True
        except:
            connectonion_available = False
        
        status = {
            "service": "optimization",
            "status": "healthy" if not missing_files and connectonion_available else "degraded",
            "data_files": {
                "available": len(required_files) - len(missing_files),
                "total": len(required_files),
                "missing": missing_files
            },
            "connectonion_available": connectonion_available,
            "timestamp": datetime.now(timezone.utc)
        }
        
        return status
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get optimization status: {str(e)}"
        )
