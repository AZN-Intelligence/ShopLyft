# Stores API Router
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
import math
from pathlib import Path

from api.models import (
    Store, StoreResponse, StoreSearchRequest, StoreSearchResponse,
    Location, ErrorResponse
)

router = APIRouter()

def load_json_data(filename: str) -> dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent.parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

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

@router.get("/", response_model=StoreResponse, summary="Get all stores")
async def get_all_stores():
    """Get all stores from the database."""
    try:
        stores_data = load_json_data("stores.json")
        stores = [Store(**store) for store in stores_data.get("stores", [])]
        return StoreResponse(stores=stores)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load stores: {str(e)}"
        )

@router.get("/search", response_model=StoreSearchResponse, summary="Search stores")
async def search_stores(
    lat: Optional[float] = Query(None, description="Latitude for location-based search"),
    lng: Optional[float] = Query(None, description="Longitude for location-based search"),
    retailer_id: Optional[str] = Query(None, description="Filter by retailer"),
    suburb: Optional[str] = Query(None, description="Filter by suburb"),
    radius_km: Optional[float] = Query(10.0, description="Search radius in kilometers")
):
    """Search stores by location, retailer, or suburb."""
    try:
        stores_data = load_json_data("stores.json")
        all_stores = stores_data.get("stores", [])
        
        # Filter by retailer if specified
        if retailer_id:
            all_stores = [s for s in all_stores if s.get("retailer_id") == retailer_id]
        
        # Filter by suburb if specified
        if suburb:
            all_stores = [s for s in all_stores if s.get("suburb", "").lower() == suburb.lower()]
        
        # Filter by location if specified
        if lat is not None and lng is not None:
            nearby_stores = []
            for store in all_stores:
                store_location = store.get("location", {})
                if store_location:
                    distance = haversine_distance(
                        lat, lng,
                        store_location.get("lat", 0),
                        store_location.get("lng", 0)
                    )
                    if distance <= radius_km:
                        store["distance_km"] = distance
                        nearby_stores.append(store)
            all_stores = nearby_stores
        
        stores = [Store(**store) for store in all_stores]
        return StoreSearchResponse(stores=stores, total_count=len(stores))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search stores: {str(e)}"
        )

@router.get("/retailers", summary="Get all retailers")
async def get_retailers():
    """Get all available retailers."""
    try:
        stores_data = load_json_data("stores.json")
        retailers = set()
        
        for store in stores_data.get("stores", []):
            retailer_id = store.get("retailer_id")
            if retailer_id:
                retailers.add(retailer_id)
        
        return {"retailers": sorted(list(retailers))}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load retailers: {str(e)}"
        )

@router.get("/suburbs", summary="Get all suburbs")
async def get_suburbs():
    """Get all available suburbs."""
    try:
        stores_data = load_json_data("stores.json")
        suburbs = set()
        
        for store in stores_data.get("stores", []):
            suburb = store.get("suburb")
            if suburb:
                suburbs.add(suburb)
        
        return {"suburbs": sorted(list(suburbs))}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load suburbs: {str(e)}"
        )

@router.get("/{store_id}", response_model=Store, summary="Get store by ID")
async def get_store_by_id(store_id: str):
    """Get a specific store by its ID."""
    try:
        stores_data = load_json_data("stores.json")
        
        for store in stores_data.get("stores", []):
            if store.get("store_id") == store_id:
                return Store(**store)
        
        raise HTTPException(
            status_code=404,
            detail=f"Store with ID '{store_id}' not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load store: {str(e)}"
        )

@router.get("/retailer/{retailer_id}", response_model=StoreResponse, summary="Get stores by retailer")
async def get_stores_by_retailer(retailer_id: str):
    """Get all stores for a specific retailer."""
    try:
        stores_data = load_json_data("stores.json")
        stores = []
        
        for store in stores_data.get("stores", []):
            if store.get("retailer_id") == retailer_id:
                stores.append(Store(**store))
        
        return StoreResponse(stores=stores)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load stores by retailer: {str(e)}"
        )

@router.get("/suburb/{suburb}", response_model=StoreResponse, summary="Get stores by suburb")
async def get_stores_by_suburb(suburb: str):
    """Get all stores in a specific suburb."""
    try:
        stores_data = load_json_data("stores.json")
        stores = []
        
        for store in stores_data.get("stores", []):
            if store.get("suburb", "").lower() == suburb.lower():
                stores.append(Store(**store))
        
        return StoreResponse(stores=stores)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load stores by suburb: {str(e)}"
        )

@router.post("/nearby", response_model=StoreSearchResponse, summary="Find nearby stores")
async def find_nearby_stores(request: StoreSearchRequest):
    """Find stores near a specific location."""
    try:
        if not request.location:
            raise HTTPException(
                status_code=400,
                detail="Location is required for nearby search"
            )
        
        stores_data = load_json_data("stores.json")
        all_stores = stores_data.get("stores", [])
        
        # Filter by retailer if specified
        if request.retailer_id:
            all_stores = [s for s in all_stores if s.get("retailer_id") == request.retailer_id]
        
        # Filter by suburb if specified
        if request.suburb:
            all_stores = [s for s in all_stores if s.get("suburb", "").lower() == request.suburb.lower()]
        
        # Calculate distances and filter by radius
        nearby_stores = []
        for store in all_stores:
            store_location = store.get("location", {})
            if store_location:
                distance = haversine_distance(
                    request.location.lat, request.location.lng,
                    store_location.get("lat", 0),
                    store_location.get("lng", 0)
                )
                # Default radius of 10km if not specified
                radius_km = getattr(request, 'radius_km', 10.0)
                if distance <= radius_km:
                    store["distance_km"] = distance
                    nearby_stores.append(store)
        
        # Sort by distance
        nearby_stores.sort(key=lambda x: x.get("distance_km", 0))
        
        stores = [Store(**store) for store in nearby_stores]
        return StoreSearchResponse(stores=stores, total_count=len(stores))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find nearby stores: {str(e)}"
        )

@router.get("/location/parse", summary="Parse location string")
async def parse_location(location_input: str = Query(..., description="Location string to parse")):
    """Parse a location string to coordinates using known locations."""
    try:
        location_input = location_input.strip().lower()
        
        # First, try to parse as coordinates
        try:
            import re
            coord_pattern = r'-?\d+\.?\d*'
            coords = re.findall(coord_pattern, location_input)
            if len(coords) >= 2:
                lat = float(coords[0])
                lng = float(coords[1])
                return {"location": Location(lat=lat, lng=lng), "parsed_from": "coordinates"}
        except (ValueError, IndexError):
            pass
        
        # Load stores data for location mapping
        stores_data = load_json_data("stores.json")
        
        # Build location map from actual stores data
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
            return {"location": Location(**location_map[location_input]), "parsed_from": location_input}
        
        # Try partial matches
        for known_location, coords in location_map.items():
            if location_input in known_location or known_location in location_input:
                return {"location": Location(**coords), "parsed_from": known_location}
        
        # Default to Sydney CBD (Woolworths Town Hall coordinates)
        default_location = Location(lat=-33.871, lng=151.206)
        return {"location": default_location, "parsed_from": "default_sydney_cbd"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse location: {str(e)}"
        )
