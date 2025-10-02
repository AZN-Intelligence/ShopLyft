# Optimization API Router
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
import json
import math
import itertools
import urllib.parse
import asyncio
import aiohttp
from datetime import datetime, timezone
from pathlib import Path

from api.models import (
    OptimizationRequest, OptimizationResponse, ShoppingListRequest, ShoppingListResponse,
    ParsedProduct, ShoppingPlan, StoreBasket, RouteStore, RouteItem,
    StartingLocation, RouteSegment, OptimizationDetails, Location,
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

def generate_all_possible_retailer_routes(
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    max_retailers: int = 3
) -> List[Dict[str, Any]]:
    """Generate every possible route for all retailer subsets."""
    
    # Get unique retailers from dataset
    retailers = set()
    stores_by_retailer = {}
    
    for item in price_dataset:
        retailer_id = item["retailer_id"]
        store_info = item["store_info"]
        
        retailers.add(retailer_id)
        
        if retailer_id not in stores_by_retailer:
            stores_by_retailer[retailer_id] = []
        
        # Only add unique stores per retailer
        store_exists = any(s["store_id"] == store_info["store_id"] for s in stores_by_retailer[retailer_id])
        if not store_exists:
            stores_by_retailer[retailer_id].append(store_info)
    
    retailer_list = list(retailers)
    
    # Generate all possible combinations of retailers (1 to max_retailers)
    all_routes = []
    
    for num_retailers in range(1, min(len(retailer_list) + 1, max_retailers + 1)):
        for retailer_combination in itertools.combinations(retailer_list, num_retailers):
            # For each retailer subset, find the closest store to user location for each retailer
            closest_stores = []
            
            for retailer_id in retailer_combination:
                if retailer_id in stores_by_retailer:
                    # Find closest store for this retailer
                    closest_store = min(
                        stores_by_retailer[retailer_id],
                        key=lambda store: haversine_distance(
                            user_location["lat"], user_location["lng"],
                            store["location"]["lat"], store["location"]["lng"]
                        )
                    )
                    closest_stores.append(closest_store)
            
            if len(closest_stores) == len(retailer_combination):
                # Generate all permutations of visiting these stores (for TSP)
                for store_permutation in itertools.permutations(closest_stores):
                    route = list(store_permutation)
                    all_routes.append({
                        "stores": route,
                        "retailers": list(retailer_combination),
                        "num_stores": len(route),
                        "num_retailers": len(retailer_combination)
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

def calculate_round_trip_time(user_location: Dict[str, float], route_stores: List[Dict[str, Any]]) -> float:
    """Calculate round trip travel time starting and ending at user location."""
    if not route_stores:
        return 0.0
    
    total_time = 0.0
    current_location = user_location
    
    # Visit each store in order
    for store in route_stores:
        # Calculate distance using Haversine formula
        distance = haversine_distance(
            current_location["lat"], current_location["lng"],
            store["location"]["lat"], store["location"]["lng"]
        )
        
        # Convert distance to time (assume 30 km/h average speed)
        travel_time = (distance / 30.0) * 60.0  # Convert to minutes
        total_time += travel_time
        
        # Update current location to this store
        current_location = store["location"]
    
    # Return to starting location
    if route_stores:
        final_distance = haversine_distance(
            current_location["lat"], current_location["lng"],
            user_location["lat"], user_location["lng"]
        )
        final_travel_time = (final_distance / 30.0) * 60.0
        total_time += final_travel_time
    
    return total_time

def score_retailer_route(
    route: Dict[str, Any], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]:
    """Score a retailer-based route based on price and time optimization."""
    
    route_stores = route["stores"]
    route_retailers = set(route["retailers"])
    
    # Filter price dataset to only include items from retailers in this route
    available_items = [item for item in price_dataset if item["retailer_id"] in route_retailers]
    
    # Group items by canonical_id to find cheapest option for each product
    items_by_canonical_id = {}
    for item in available_items:
        canonical_id = item["canonical_id"]
        if canonical_id not in items_by_canonical_id:
            items_by_canonical_id[canonical_id] = []
        items_by_canonical_id[canonical_id].append(item)
    
    # For each product, find the cheapest option from available retailers
    item_assignments = {}
    total_price = 0.0
    
    for canonical_id, item_options in items_by_canonical_id.items():
        # Find the cheapest option for this product
        best_item = min(item_options, key=lambda x: x["price"])
        
        # Find the corresponding store in our route
        best_store = None
        for store in route_stores:
            if store["retailer_id"] == best_item["retailer_id"]:
                best_store = store
                break
        
        if best_store:
            item_assignments[canonical_id] = {
                "store": best_store,
                "item": best_item,
                "total_price": best_item["price"] * best_item["quantity"]
            }
            total_price += best_item["price"] * best_item["quantity"]
    
    # Calculate travel time for round trip
    travel_time = calculate_round_trip_time(user_location, route_stores)
    
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
        "num_items": len(item_assignments),
        "available_items_count": len(available_items),
        "retailers_used": route_retailers
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

def find_optimal_retailer_route(
    all_routes: List[Dict[str, Any]], 
    price_dataset: List[Dict[str, Any]], 
    user_location: Dict[str, float],
    time_weight: float = 0.2,
    price_weight: float = 0.8
) -> Dict[str, Any]:
    """Find the retailer-based route with the best score."""
    
    scored_routes = []
    
    for route in all_routes:
        scored_route = score_retailer_route(route, price_dataset, user_location, time_weight, price_weight)
        scored_routes.append(scored_route)
    
    # Sort by total score (lower is better)
    scored_routes.sort(key=lambda x: x["total_score"])
    
    return scored_routes[0] if scored_routes else None

def calculate_single_store_baseline(price_dataset: List[Dict[str, Any]], parsed_products: List[ParsedProduct]) -> float:
    """Calculate the cost if shopping at the most expensive single store."""
    # Group items by retailer and calculate total cost per retailer
    retailer_costs = {}
    
    for item in price_dataset:
        retailer_id = item["retailer_id"]
        canonical_id = item["canonical_id"]
        
        if retailer_id not in retailer_costs:
            retailer_costs[retailer_id] = {}
        
        # Keep track of cheapest price per item per retailer
        if canonical_id not in retailer_costs[retailer_id]:
            retailer_costs[retailer_id][canonical_id] = float('inf')
        
        retailer_costs[retailer_id][canonical_id] = min(
            retailer_costs[retailer_id][canonical_id],
            item["price"] * item["quantity"]
        )
    
    # Calculate total cost per retailer
    retailer_totals = {}
    for retailer_id, items in retailer_costs.items():
        retailer_totals[retailer_id] = sum(items.values())
    
    # Return the highest single-retailer cost
    return max(retailer_totals.values()) if retailer_totals else 0.0

def generate_route_segments(user_location: Dict[str, float], route_stores: List[Dict[str, Any]]) -> List[RouteSegment]:
    """Generate route segments between stores."""
    segments = []
    current_location = user_location
    
    for i, store in enumerate(route_stores):
        # Calculate distance and time to this store
        distance = haversine_distance(
            current_location["lat"], current_location["lng"],
            store["location"]["lat"], store["location"]["lng"]
        )
        travel_time = (distance / 30.0) * 60.0  # 30 km/h to minutes
        
        segment = RouteSegment(
            from_store_id=None if i == 0 else route_stores[i-1]["store_id"],
            to_store_id=store["store_id"],
            distance_km=round(distance, 2),
            travel_time_min=round(travel_time, 1),
            travel_method="walking"
        )
        segments.append(segment)
        
        # Update current location
        current_location = store["location"]
    
    return segments

async def search_woolworths_product_with_browser(product_name: str) -> Optional[str]:
    """Search Woolworths using headless browser to access shadow DOM content."""
    try:
        from playwright.async_api import async_playwright
        
        # URL encode the product name for the search
        encoded_product = urllib.parse.quote(product_name)
        search_url = f"https://www.woolworths.com.au/shop/search/products?searchTerm={encoded_product}&pageNumber=1&sortBy=CUPAsc"
        
        print(f"[ShopLyft] Searching Woolworths with browser for: '{product_name}' -> {search_url}")
        
        async with async_playwright() as p:
            # Launch browser with more realistic settings to avoid detection
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-http2',  # Disable HTTP/2 to avoid protocol errors
                    '--disable-web-security',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                ]
            )
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
                locale='en-AU',
                timezone_id='Australia/Sydney',
                extra_http_headers={
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-AU,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'max-age=0',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                }
            )
            page = await context.new_page()
            
            # Add stealth measures
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                window.chrome = {
                    runtime: {},
                };
                
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-AU', 'en'],
                });
            """)
            
            try:
                # Try multiple navigation strategies
                navigation_strategies = [
                    {'wait_until': 'domcontentloaded', 'timeout': 15000},
                    {'wait_until': 'load', 'timeout': 20000},
                    {'wait_until': 'networkidle', 'timeout': 30000},
                ]
                
                page_loaded = False
                for strategy in navigation_strategies:
                    try:
                        print(f"[ShopLyft] Trying navigation strategy: {strategy}")
                        await page.goto(search_url, **strategy)
                        page_loaded = True
                        break
                    except Exception as nav_error:
                        print(f"[ShopLyft] Navigation strategy failed: {nav_error}")
                        continue
                
                if not page_loaded:
                    print("[ShopLyft] All navigation strategies failed")
                    return None
                
                # Wait for product tiles to load
                await page.wait_for_selector('wc-product-tile', timeout=10000)
                
                # Extract product links from shadow DOM
                product_links = await page.evaluate("""
                    () => {
                        const links = [];
                        const productTiles = document.querySelectorAll('wc-product-tile');
                        
                        productTiles.forEach(tile => {
                            if (tile.shadowRoot) {
                                // Look for links in shadow DOM
                                const shadowLinks = tile.shadowRoot.querySelectorAll('a[href*="/shop/productdetails/"]');
                                shadowLinks.forEach(link => {
                                    if (link.href && link.href.includes('/shop/productdetails/')) {
                                        links.push(link.href);
                                    }
                                });
                            }
                        });
                        
                        // Also check regular DOM for any product links
                        const regularLinks = document.querySelectorAll('a[href*="/shop/productdetails/"]');
                        regularLinks.forEach(link => {
                            if (link.href && link.href.includes('/shop/productdetails/')) {
                                links.push(link.href);
                            }
                        });
                        
                        // Remove duplicates
                        return [...new Set(links)];
                    }
                """)
                
                print(f"[ShopLyft] Browser found {len(product_links)} product links for '{product_name}':")
                for i, link in enumerate(product_links[:10], 1):  # Show first 10
                    print(f"[ShopLyft]   {i}. {link}")
                
                if product_links:
                    selected_url = product_links[0]  # First one should be cheapest due to sortBy=CUPAsc
                    print(f"[ShopLyft] Selected product URL for '{product_name}': {selected_url}")
                    return selected_url
                else:
                    print(f"[ShopLyft] No product links found in browser for '{product_name}'")
                    return None
                    
            finally:
                await browser.close()
                
    except ImportError:
        print("[ShopLyft] Playwright not available, falling back to HTTP request method")
        return None
    except Exception as e:
        print(f"[ShopLyft] Error in browser search for '{product_name}': {str(e)}")
        
        # If it's an HTTP/2 error, suggest the issue
        if "ERR_HTTP2_PROTOCOL_ERROR" in str(e):
            print("[ShopLyft] HTTP/2 protocol error detected - this usually means:")
            print("  1. Woolworths is blocking automated browsers")
            print("  2. Network/proxy is interfering with HTTP/2")
            print("  3. Server-side HTTP/2 configuration issues")
            print("[ShopLyft] Falling back to HTTP method...")
        
        return None

async def search_woolworths_product_fallback(product_name: str) -> Optional[str]:
    """Fallback method using HTTP requests when browser is not available."""
    try:
        # URL encode the product name for the search
        encoded_product = urllib.parse.quote(product_name)
        search_url = f"https://www.woolworths.com.au/shop/search/products?searchTerm={encoded_product}&pageNumber=1&sortBy=CUPAsc"
        
        print(f"[ShopLyft] Fallback: Searching Woolworths for: '{product_name}' -> {search_url}")
        
        async with aiohttp.ClientSession() as session:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
            }
            
            async with session.get(search_url, headers=headers, timeout=15) as response:
                print(f"[ShopLyft] Fallback: Woolworths response status: {response.status}")
                
                if response.status == 200:
                    html_content = await response.text()
                    print(f"[ShopLyft] Fallback: Received HTML content length: {len(html_content)}")
                    
                    # Parse HTML to find product links
                    product_link = await extract_any_product_link(html_content, product_name)
                    
                    if product_link:
                        print(f"[ShopLyft] Fallback: Found Woolworths product link for '{product_name}': {product_link}")
                        return product_link
                    else:
                        print(f"[ShopLyft] Fallback: No product links found, using search URL")
                        return generate_woolworths_fallback_link(product_name)
                        
                elif response.status == 403:
                    print("[ShopLyft] Fallback: Woolworths blocked the request (403 Forbidden)")
                elif response.status == 429:
                    print("[ShopLyft] Fallback: Woolworths rate limited the request (429 Too Many Requests)")
                else:
                    print(f"[ShopLyft] Fallback: Woolworths returned status {response.status}")
                    
    except asyncio.TimeoutError:
        print(f"[ShopLyft] Fallback: Timeout while searching Woolworths for '{product_name}'")
    except Exception as e:
        print(f"[ShopLyft] Fallback: Error searching Woolworths for '{product_name}': {str(e)}")
    
    return generate_woolworths_fallback_link(product_name)

async def search_woolworths_product_simple_browser(product_name: str) -> Optional[str]:
    """Simplified browser approach with minimal detection footprint."""
    try:
        from playwright.async_api import async_playwright
        
        encoded_product = urllib.parse.quote(product_name)
        search_url = f"https://www.woolworths.com.au/shop/search/products?searchTerm={encoded_product}&pageNumber=1&sortBy=CUPAsc"
        
        print(f"[ShopLyft] Trying simple browser approach for: '{product_name}'")
        
        async with async_playwright() as p:
            # Use Firefox instead of Chrome - often less detected
            browser = await p.firefox.launch(
                headless=True,
                args=['--no-sandbox']
            )
            
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                viewport={'width': 1366, 'height': 768},
            )
            page = await context.new_page()
            
            try:
                # Simple navigation without waiting for network idle
                await page.goto(search_url, wait_until='domcontentloaded', timeout=20000)
                
                # Wait a bit for dynamic content
                await page.wait_for_timeout(3000)
                
                # Try to find any product links in the page
                links = await page.evaluate("""
                    () => {
                        const allLinks = [];
                        
                        // Look for any links containing productdetails
                        const links = document.querySelectorAll('a[href*="productdetails"]');
                        links.forEach(link => {
                            if (link.href) allLinks.push(link.href);
                        });
                        
                        // Also check for any shadow DOM elements
                        const tiles = document.querySelectorAll('wc-product-tile');
                        tiles.forEach(tile => {
                            if (tile.shadowRoot) {
                                const shadowLinks = tile.shadowRoot.querySelectorAll('a[href*="productdetails"]');
                                shadowLinks.forEach(link => {
                                    if (link.href) allLinks.push(link.href);
                                });
                            }
                        });
                        
                        return [...new Set(allLinks)];
                    }
                """)
                
                if links and len(links) > 0:
                    print(f"[ShopLyft] Simple browser found {len(links)} links for '{product_name}'")
                    return links[0]
                else:
                    print(f"[ShopLyft] Simple browser found no links for '{product_name}'")
                    return None
                    
            finally:
                await browser.close()
                
    except Exception as e:
        print(f"[ShopLyft] Simple browser method failed for '{product_name}': {str(e)}")
        return None

async def search_woolworths_product(product_name: str) -> Optional[str]:
    """Search Woolworths for a product and return the cheapest item's link."""
    
    # Strategy 1: Try simple browser approach first (Firefox, less detection)
    print(f"[ShopLyft] Attempting simple browser search for '{product_name}'")
    result = await search_woolworths_product_simple_browser(product_name)
    if result:
        return result
    
    # Strategy 2: Try full browser method with stealth (Chromium)
    print(f"[ShopLyft] Simple browser failed, trying full browser method for '{product_name}'")
    result = await search_woolworths_product_with_browser(product_name)
    if result:
        return result
    
    # Strategy 3: Fallback to HTTP method
    print(f"[ShopLyft] All browser methods failed, trying HTTP fallback for '{product_name}'")
    return await search_woolworths_product_fallback(product_name)

async def extract_any_product_link(html_content: str, search_term: str) -> Optional[str]:
    """Extract any valid product link from Woolworths search results."""
    import re
    
    try:
        # Updated patterns based on actual Woolworths HTML structure
        # Example: <a href="/shop/productdetails/807432/jinmailang-egg-noodle" aria-label="Find out more about Jinmailang Egg Noodle 1kg" class="">
        url_patterns = [
            # Primary pattern: href="/shop/productdetails/NUMBER/product-name"
            r'href="(/shop/productdetails/\d+/[^"]*)"',
            # Alternative pattern with single quotes
            r"href='(/shop/productdetails/\d+/[^']*)'",
            # Pattern without quotes (less common but possible)
            r'href=(/shop/productdetails/\d+/[^\s>]*)',
            # Pattern for URLs that might be in JavaScript or data attributes
            r'"/shop/productdetails/\d+/[^"]*"',
            r"'/shop/productdetails/\d+/[^']*'",
            # Pattern for URLs in onclick handlers or other attributes
            r'/shop/productdetails/\d+/[\w\-]+',
        ]
        
        all_found_urls = []
        
        # Test each pattern individually and show results
        pattern_names = [
            'href with double quotes',
            'href with single quotes', 
            'href without quotes',
            'URLs in data/JS with double quotes',
            'URLs in data/JS with single quotes',
            'bare URLs'
        ]
        
        for i, pattern in enumerate(url_patterns):
            matches = re.findall(pattern, html_content)
            print(f"[ShopLyft] Pattern {i+1} ({pattern_names[i]}): '{pattern}' found {len(matches)} matches")
            
            if matches:
                print(f"[ShopLyft] Raw matches for pattern {i+1}: {matches[:5]}")  # Show first 5 matches
                
                for match in matches:
                    # Clean up the URL
                    relative_url = match.strip()
                    
                    # Remove surrounding quotes if present
                    if relative_url.startswith('"') and relative_url.endswith('"'):
                        relative_url = relative_url[1:-1]
                    elif relative_url.startswith("'") and relative_url.endswith("'"):
                        relative_url = relative_url[1:-1]
                    
                    # Ensure it starts with /shop/productdetails
                    if not relative_url.startswith('/shop/productdetails'):
                        if relative_url.startswith('shop/productdetails'):
                            relative_url = '/' + relative_url
                        else:
                            continue
                    
                    # Validate the URL format (should have numeric ID)
                    if not re.match(r'/shop/productdetails/\d+/', relative_url):
                        continue
                    
                    full_url = f"https://www.woolworths.com.au{relative_url}"
                    all_found_urls.append(full_url)
        
        # Remove duplicates while preserving order
        unique_urls = []
        seen = set()
        for url in all_found_urls:
            if url not in seen:
                unique_urls.append(url)
                seen.add(url)
        
        # Print all found product links for debugging
        if unique_urls:
            print(f"[ShopLyft] Found {len(unique_urls)} product links for '{search_term}':")
            for i, url in enumerate(unique_urls, 1):
                print(f"[ShopLyft]   {i}. {url}")
            
            # Return the first one (they're sorted by price since we use sortBy=CUPAsc)
            selected_url = unique_urls[0]
            print(f"[ShopLyft] Selected first product URL for '{search_term}': {selected_url}")
            return selected_url
        else:
            print(f"[ShopLyft] No product URLs found in search results for '{search_term}'")
            # Debug: Look for any productdetails mentions in the HTML
            productdetails_count = html_content.count('productdetails')
            if productdetails_count > 0:
                print(f"[ShopLyft] HTML contains {productdetails_count} mentions of 'productdetails' but no valid URLs extracted")
                # Show a sample of where productdetails appears
                import re
                sample_matches = re.findall(r'.{0,50}productdetails.{0,50}', html_content)[:3]
                for i, sample in enumerate(sample_matches, 1):
                    print(f"[ShopLyft] Sample {i}: ...{sample}...")
            return None
        
    except Exception as e:
        print(f"[ShopLyft] Error extracting product link: {str(e)}")
        return None

async def parse_woolworths_search_results(html_content: str, search_term: str) -> Optional[Dict[str, Any]]:
    """Parse Woolworths search results HTML to find the cheapest product."""
    import re
    import json
    
    try:
        # Try to find JSON data embedded in the HTML (common in modern web apps)
        json_patterns = [
            r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
            r'window\.__PRELOADED_STATE__\s*=\s*({.*?});',
            r'window\.__NEXT_DATA__\s*=\s*({.*?})</script>',
            r'"products":\s*(\[.*?\])',
            r'"searchResults":\s*({.*?})',
            r'"productTiles":\s*(\[.*?\])',
            r'"bundles":\s*(\[.*?\])',
            r'data-testid="search-results"[^>]*>.*?<script[^>]*>({.*?})</script>',
        ]
        
        products = []
        
        # Try JSON extraction first
        for pattern in json_patterns:
            matches = re.findall(pattern, html_content, re.DOTALL)
            for match in matches:
                try:
                    if isinstance(match, str):
                        data = json.loads(match)
                        # Extract products from various possible JSON structures
                        extracted_products = extract_products_from_json(data)
                        products.extend(extracted_products)
                except json.JSONDecodeError:
                    continue
        
        # If JSON extraction didn't work, try HTML parsing
        if not products:
            products = extract_products_from_html(html_content)
        
        if not products:
            print(f"[ShopLyft] No products extracted from search results for '{search_term}'")
            return None
        
        print(f"[ShopLyft] Extracted {len(products)} products from search results")
        
        # Find the cheapest product
        cheapest = min(products, key=lambda p: p.get('price', float('inf')))
        
        if cheapest and cheapest.get('price', 0) > 0:
            return cheapest
        else:
            print(f"[ShopLyft] No valid products with prices found")
            return None
            
    except Exception as e:
        print(f"[ShopLyft] Error parsing search results: {str(e)}")
        return None

def extract_products_from_json(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract product information from JSON data."""
    products = []
    
    def find_products_recursive(obj, path=""):
        """Recursively search for product arrays in nested JSON."""
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                if key in ['products', 'items', 'searchResults', 'productList']:
                    if isinstance(value, list):
                        for item in value:
                            product = extract_single_product(item)
                            if product:
                                products.append(product)
                elif isinstance(value, (dict, list)):
                    find_products_recursive(value, current_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                find_products_recursive(item, f"{path}[{i}]")
    
    find_products_recursive(data)
    return products

def extract_single_product(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract product information from a single product object."""
    try:
        # Common field names for product information
        name_fields = ['name', 'title', 'displayName', 'productName', 'description']
        price_fields = ['price', 'unitPrice', 'currentPrice', 'salePrice', 'cost']
        url_fields = ['url', 'link', 'href', 'productUrl', 'detailsUrl', 'productDetailsUrl']
        id_fields = ['id', 'productId', 'sku', 'stockcode']
        
        # Extract name
        name = None
        for field in name_fields:
            if field in item and item[field]:
                name = str(item[field]).strip()
                break
        
        # Extract price
        price = None
        for field in price_fields:
            if field in item:
                try:
                    price_val = item[field]
                    if isinstance(price_val, (int, float)):
                        price = float(price_val)
                        break
                    elif isinstance(price_val, str):
                        # Extract numeric value from string like "$3.50" or "3.50"
                        import re
                        price_match = re.search(r'[\d.]+', price_val.replace(',', ''))
                        if price_match:
                            price = float(price_match.group())
                            break
                except (ValueError, TypeError):
                    continue
        
        # Extract URL
        url = None
        for field in url_fields:
            if field in item and item[field]:
                url_val = str(item[field]).strip()
                if '/shop/productdetails/' in url_val:
                    if url_val.startswith('/'):
                        url = f"https://www.woolworths.com.au{url_val}"
                    elif url_val.startswith('http'):
                        url = url_val
                    else:
                        url = f"https://www.woolworths.com.au/{url_val}"
                    break
        
        # Extract product ID for URL construction if direct URL not found
        product_id = None
        for field in id_fields:
            if field in item and item[field]:
                product_id = str(item[field])
                break
        
        # If we have name and price but no URL, try to construct one
        if name and price and not url and product_id:
            # Create URL from product ID
            name_slug = name.lower().replace(' ', '-').replace("'", "").replace('"', '')
            url = f"https://www.woolworths.com.au/shop/productdetails/{product_id}/{name_slug}"
        
        if name and price and url:
            return {
                'name': name,
                'price': price,
                'url': url,
                'id': product_id
            }
        
    except Exception as e:
        print(f"[ShopLyft] Error extracting product: {str(e)}")
    
    return None

def extract_products_from_html(html_content: str) -> List[Dict[str, Any]]:
    """Extract product information from HTML using regex patterns for Woolworths product tiles."""
    import re
    
    products = []
    
    try:
        # Updated patterns to match Woolworths product tile structure
        # Look for wc-product-tile components which contain the product information
        product_tile_pattern = r'<wc-product-tile[^>]*>.*?</wc-product-tile>'
        product_tiles = re.findall(product_tile_pattern, html_content, re.DOTALL | re.IGNORECASE)
        
        print(f"[ShopLyft] Found {len(product_tiles)} product tiles")
        
        for tile in product_tiles:
            product = extract_product_from_tile(tile)
            if product:
                products.append(product)
        
        # Fallback: Look for product links and prices in the general HTML
        if not products:
            products = extract_products_fallback_patterns(html_content)
        
        print(f"[ShopLyft] HTML parsing extracted {len(products)} products")
        
    except Exception as e:
        print(f"[ShopLyft] Error in HTML parsing: {str(e)}")
    
    return products

def extract_product_from_tile(tile_html: str) -> Optional[Dict[str, Any]]:
    """Extract product information from a single Woolworths product tile."""
    import re
    
    try:
        # Extract product URL - look for href="/shop/productdetails/..."
        url_patterns = [
            r'href="(/shop/productdetails/\d+/[^"]+)"',
            r'href=\'(/shop/productdetails/\d+/[^\']+)\'',
        ]
        
        url = None
        for pattern in url_patterns:
            url_match = re.search(pattern, tile_html)
            if url_match:
                url = f"https://www.woolworths.com.au{url_match.group(1)}"
                break
        
        # Extract product name - look for the title in the link or aria-label
        name_patterns = [
            r'aria-label="[^"]*?([^"]+?)\s*(?:\d+(?:kg|g|L|mL|pack|ea)?)?"[^>]*>([^<]+)</a>',
            r'>([^<]+?(?:\d+(?:kg|g|L|mL|pack|ea))?[^<]*)</a>',
            r'title="([^"]+)"',
            r'aria-label="Find out more about ([^"]+)"',
        ]
        
        name = None
        for pattern in name_patterns:
            name_match = re.search(pattern, tile_html, re.IGNORECASE)
            if name_match:
                # Take the longest match (more descriptive)
                potential_name = name_match.group(1) if name_match.lastindex == 1 else name_match.group(2)
                if not name or len(potential_name) > len(name):
                    name = potential_name.strip()
        
        # Extract price - look in product-tile-price section
        price_patterns = [
            r'<div class="primary"[^>]*>\s*<!--[^>]*-->\s*\$(\d+\.?\d*)',
            r'class="product-tile-price"[^>]*>.*?<div class="primary"[^>]*>.*?\$(\d+\.?\d*)',
            r'\$(\d+\.?\d*)\s*(?:/|\s+per)',
            r'>\$(\d+\.?\d*)<',
        ]
        
        price = None
        for pattern in price_patterns:
            price_match = re.search(pattern, tile_html, re.DOTALL)
            if price_match:
                try:
                    price = float(price_match.group(1))
                    break
                except ValueError:
                    continue
        
        # Extract product ID from URL for validation
        product_id = None
        if url:
            id_match = re.search(r'/productdetails/(\d+)/', url)
            if id_match:
                product_id = id_match.group(1)
        
        if name and price and url:
            product_info = {
                'name': name,
                'price': price,
                'url': url,
                'id': product_id
            }
            print(f"[ShopLyft] Extracted product: {name} - ${price} -> {url}")
            return product_info
        else:
            print(f"[ShopLyft] Incomplete product data - Name: {name}, Price: {price}, URL: {url}")
    
    except Exception as e:
        print(f"[ShopLyft] Error extracting product from tile: {str(e)}")
    
    return None

def extract_products_fallback_patterns(html_content: str) -> List[Dict[str, Any]]:
    """Fallback method to extract products using broader patterns."""
    import re
    
    products = []
    
    try:
        # Find all product detail URLs in the HTML
        url_pattern = r'href="(/shop/productdetails/\d+/[^"]+)"'
        urls = re.findall(url_pattern, html_content)
        
        # Find all prices in the HTML
        price_pattern = r'\$(\d+\.?\d*)'
        prices = re.findall(price_pattern, html_content)
        
        # Find product names - look for common patterns
        name_patterns = [
            r'aria-label="[^"]*?([^"]+?(?:\d+(?:kg|g|L|mL|pack|ea))?[^"]*)"',
            r'title="([^"]+)"',
            r'>([A-Z][^<]{10,})</a>',  # Capitalized text in links
        ]
        
        names = []
        for pattern in name_patterns:
            found_names = re.findall(pattern, html_content, re.IGNORECASE)
            names.extend(found_names)
        
        # Try to match URLs with prices and names
        min_length = min(len(urls), len(prices))
        for i in range(min_length):
            if i < len(names):
                name = names[i].strip()
            else:
                # Generate name from URL if not found
                url_parts = urls[i].split('/')
                if len(url_parts) > 2:
                    name = url_parts[-1].replace('-', ' ').title()
                else:
                    name = f"Product {i+1}"
            
            try:
                price = float(prices[i])
                url = f"https://www.woolworths.com.au{urls[i]}"
                
                products.append({
                    'name': name,
                    'price': price,
                    'url': url
                })
            except ValueError:
                continue
        
        print(f"[ShopLyft] Fallback extraction found {len(products)} products")
        
    except Exception as e:
        print(f"[ShopLyft] Error in fallback extraction: {str(e)}")
    
    return products

async def generate_product_links_async(retailer_id: str, items: List[RouteItem]) -> List[str]:
    """Generate product links for a retailer - async version."""
    if retailer_id == "woolworths":
        return await generate_woolworths_links(items)
    else:
        # Fallback for other retailers (placeholder implementation)
        base_urls = {
            "coles": "https://www.coles.com.au/product/",
            "aldi": "https://www.aldi.com.au/product/"
        }
        
        links = []
        base_url = base_urls.get(retailer_id, "")
        
        for item in items:
            # Generate a placeholder link based on product name
            product_slug = item.product_name.lower().replace(" ", "-").replace("'", "")
            link = f"{base_url}{product_slug}"
            links.append(link)
        
        return links

async def validate_woolworths_link(url: str) -> bool:
    """Validate if a Woolworths link is accessible."""
    try:
        async with aiohttp.ClientSession() as session:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            async with session.head(url, headers=headers, timeout=5) as response:
                return response.status == 200
    except:
        return False

def generate_woolworths_fallback_link(product_name: str) -> str:
    """Generate a reliable Woolworths fallback link using search URL."""
    # Always use search URL as fallback - this is guaranteed to work
    # and will show relevant products even if we can't scrape the exact product page
    encoded_name = urllib.parse.quote(product_name)
    search_url = f"https://www.woolworths.com.au/shop/search/products?searchTerm={encoded_name}"
    
    print(f"[ShopLyft] Generated fallback search URL for '{product_name}': {search_url}")
    return search_url

async def generate_woolworths_links(items: List[RouteItem]) -> List[str]:
    """Generate actual Woolworths product links by searching their website."""
    links = []
    
    # Create tasks for concurrent searching
    search_tasks = []
    for item in items:
        task = search_woolworths_product(item.product_name)
        search_tasks.append(task)
    
    # Execute all searches concurrently
    search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
    
    # Process results
    for i, result in enumerate(search_results):
        if isinstance(result, str) and result and result.startswith("https://"):
            # Valid URL found from search
            links.append(result)
        else:
            # Use improved fallback strategy
            item = items[i]
            fallback_link = generate_woolworths_fallback_link(item.product_name)
            print(f"[ShopLyft] Using fallback link for '{item.product_name}': {fallback_link}")
            links.append(fallback_link)
    
    return links

def create_empty_shopping_plan(message: str) -> ShoppingPlan:
    """Create an empty shopping plan for error responses."""
    return ShoppingPlan(
        total_cost=0.0,
        total_time=0.0,
        travel_time=0.0,
        shopping_time=0.0,
        total_savings=0.0,
        route_score=0.0,
        starting_location=StartingLocation(
            address="Unknown",
            coordinates=Location(lat=0.0, lng=0.0)
        ),
        stores=[],
        route_segments=[],
        optimization_details=OptimizationDetails(
            price_component=0.0,
            time_component=0.0,
            total_items=0,
            stores_count=0
        ),
        num_stores=0,
        store_baskets=[],
        generated_at=datetime.now(timezone.utc)
    )

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
                plan=create_empty_shopping_plan("No items could be parsed from the grocery list."),
                success=False,
                message="No items could be parsed from the grocery list."
            )
        
        # Validate that all parsed products use canonical_ids from products.json
        if not validate_products_only_from_data(parsed_list.parsed_products):
            return OptimizationResponse(
                plan=create_empty_shopping_plan("Parsed products contain invalid canonical_ids not found in products.json"),
                success=False,
                message="Parsed products contain invalid canonical_ids not found in products.json"
            )
        
        # Step 3: Route Chooser
        # Part 1: Generate price dataset
        price_dataset = generate_price_dataset(parsed_list.parsed_products)
        
        if not price_dataset:
            return OptimizationResponse(
                plan=create_empty_shopping_plan("No price data found for the parsed items."),
                success=False,
                message="No price data found for the parsed items."
            )
        
        # Part 2: Generate all possible retailer-based routes
        all_routes = generate_all_possible_retailer_routes(price_dataset, user_location, request.max_stores)
        
        if not all_routes:
            return OptimizationResponse(
                plan=create_empty_shopping_plan("No possible retailer routes found."),
                success=False,
                message="No possible retailer routes found."
            )
        
        # Part 3: Find optimal retailer route
        optimal_route = find_optimal_retailer_route(all_routes, price_dataset, user_location, request.time_weight, request.price_weight)
        
        if not optimal_route:
            return OptimizationResponse(
                plan=create_empty_shopping_plan("No optimal route found."),
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
                links=[],  # Will be populated below
                subtotal=basket_data["subtotal"],
                click_collect_eligible=meets_min_spend,
                min_spend_required=min_spend
            ))
        
        # Calculate total savings (compare to single most expensive store)
        single_store_cost = calculate_single_store_baseline(price_dataset, parsed_list.parsed_products)
        total_savings = max(0.0, single_store_cost - optimal_route["total_price"])
        
        # Create starting location with proper address formatting
        # If location is coordinates, use them directly for Google Maps compatibility
        display_address = request.location
        if "," in request.location and len(request.location.split(",")) == 2:
            # This looks like coordinates, use them directly for Google Maps
            try:
                lat, lng = request.location.split(",")
                lat_f = float(lat.strip())
                lng_f = float(lng.strip())
                # Use coordinates directly for Google Maps compatibility
                display_address = f"{lat_f},{lng_f}"
            except ValueError:
                # If parsing fails, use original location
                display_address = request.location
        
        starting_location = StartingLocation(
            address=display_address,
            coordinates=Location(lat=user_location["lat"], lng=user_location["lng"])
        )
        
        # Generate route segments
        route_segments = generate_route_segments(user_location, route_stores)
        
        # Create optimization details
        optimization_details = OptimizationDetails(
            price_component=optimal_route["price_score"],
            time_component=optimal_route["time_score"],
            total_items=optimal_route["num_items"],
            stores_count=len(route_stores)
        )
        
        # Add product links to store baskets concurrently
        link_tasks = []
        for basket in basket_list:
            task = generate_product_links_async(basket.store_info.retailer_id, basket.items)
            link_tasks.append(task)
        
        # Execute all link generation tasks concurrently with error handling
        try:
            all_links = await asyncio.gather(*link_tasks, return_exceptions=True)
            
            # Assign the results back to baskets
            for i, basket in enumerate(basket_list):
                if isinstance(all_links[i], list):
                    basket.links = all_links[i]
                else:
                    # If link generation failed, use empty list
                    print(f"[ShopLyft] Link generation failed for {basket.store_info.retailer_id}: {all_links[i]}")
                    basket.links = []
        except Exception as e:
            print(f"[ShopLyft] Error in concurrent link generation: {str(e)}")
            # Fallback: set empty links for all baskets
            for basket in basket_list:
                basket.links = []
        
        # Debug: Print the data being used to create the shopping plan
        print(f"[ShopLyft] Creating shopping plan with:")
        print(f"  - total_savings: {total_savings}")
        print(f"  - starting_location: {starting_location}")
        print(f"  - route_segments: {len(route_segments)} segments")
        print(f"  - optimization_details: {optimization_details}")
        print(f"  - stores/store_baskets: {len(basket_list)} stores")
        
        # Create shopping plan
        shopping_plan = ShoppingPlan(
            total_cost=optimal_route["total_price"],
            total_time=optimal_route["total_time"],
            travel_time=optimal_route["travel_time"],
            shopping_time=optimal_route["in_store_time"],
            total_savings=total_savings,
            route_score=optimal_route["total_score"],
            starting_location=starting_location,
            stores=basket_list,  # Frontend expects 'stores'
            route_segments=route_segments,
            optimization_details=optimization_details,
            num_stores=len(route_stores),
            store_baskets=basket_list,  # Backend compatibility
            generated_at=datetime.now(timezone.utc)
        )
        
        # Debug: Print the created shopping plan
        print(f"[ShopLyft] Shopping plan created successfully:")
        print(f"  - Plan has starting_location: {shopping_plan.starting_location is not None}")
        print(f"  - Plan has route_segments: {len(shopping_plan.route_segments)} segments")
        print(f"  - Plan has optimization_details: {shopping_plan.optimization_details is not None}")
        print(f"  - Plan has total_savings: {shopping_plan.total_savings}")
        print(f"  - Plan has stores: {len(shopping_plan.stores)} stores")
        print(f"  - Plan has store_baskets: {len(shopping_plan.store_baskets)} baskets")
        
        return OptimizationResponse(
            plan=shopping_plan,
            success=True,
            message=f"Optimized retailer-based plan generated with {len(parsed_list.parsed_products)} items across {len(optimal_route['retailers_used'])} retailers ({len(route_stores)} stores)"
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
