# Pricing API Router
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import json
from pathlib import Path

from api.models import (
    PriceSnapshot, PriceResponse, PriceComparisonRequest, PriceComparisonResponse,
    ErrorResponse
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

@router.get("/", response_model=PriceResponse, summary="Get all price snapshots")
async def get_all_prices():
    """Get all current price snapshots."""
    try:
        prices_data = load_json_data("price_snapshots.json")
        prices = [PriceSnapshot(**price) for price in prices_data.get("prices", [])]
        return PriceResponse(prices=prices)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load prices: {str(e)}"
        )

@router.get("/product/{retailer_product_id}", response_model=PriceSnapshot, summary="Get price by retailer product ID")
async def get_price_by_product_id(retailer_product_id: str):
    """Get price for a specific retailer product."""
    try:
        prices_data = load_json_data("price_snapshots.json")
        
        for price in prices_data.get("prices", []):
            if price.get("retailer_product_id") == retailer_product_id:
                return PriceSnapshot(**price)
        
        raise HTTPException(
            status_code=404,
            detail=f"Price for product '{retailer_product_id}' not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load price: {str(e)}"
        )

@router.get("/retailer/{retailer_id}", response_model=PriceResponse, summary="Get prices by retailer")
async def get_prices_by_retailer(retailer_id: str):
    """Get all prices for a specific retailer."""
    try:
        prices_data = load_json_data("price_snapshots.json")
        prices = []
        
        for price in prices_data.get("prices", []):
            if price.get("retailer_product_id", "").startswith(f"{retailer_id}:"):
                prices.append(PriceSnapshot(**price))
        
        return PriceResponse(prices=prices)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load prices by retailer: {str(e)}"
        )

@router.get("/canonical/{canonical_id}", response_model=PriceResponse, summary="Get prices by canonical product ID")
async def get_prices_by_canonical_id(canonical_id: str):
    """Get all prices for a canonical product across all retailers."""
    try:
        # Load retailer catalog to map canonical_id to retailer_product_ids
        catalog_data = load_json_data("retailer_catalog.json")
        prices_data = load_json_data("price_snapshots.json")
        
        # Find all retailer product IDs for this canonical ID
        retailer_product_ids = []
        for catalog_item in catalog_data.get("retailer_products", []):
            if catalog_item.get("canonical_id") == canonical_id:
                retailer_product_ids.append(catalog_item.get("retailer_product_id"))
        
        # Get prices for these retailer product IDs
        prices = []
        for price in prices_data.get("prices", []):
            if price.get("retailer_product_id") in retailer_product_ids:
                prices.append(PriceSnapshot(**price))
        
        return PriceResponse(prices=prices)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load prices by canonical ID: {str(e)}"
        )

@router.post("/compare", response_model=PriceComparisonResponse, summary="Compare prices for products")
async def compare_prices(request: PriceComparisonRequest):
    """Compare prices for multiple products across retailers."""
    try:
        # Load all necessary data
        catalog_data = load_json_data("retailer_catalog.json")
        prices_data = load_json_data("price_snapshots.json")
        products_data = load_json_data("products.json")
        retailers_data = load_json_data("retailers.json")
        
        # Build lookups
        price_lookup = {p["retailer_product_id"]: p for p in prices_data.get("prices", [])}
        product_lookup = {p["canonical_id"]: p for p in products_data.get("products", [])}
        retailer_lookup = {r["retailer_id"]: r for r in retailers_data.get("retailers", [])}
        
        comparisons = []
        
        for canonical_id in request.canonical_ids:
            if canonical_id not in product_lookup:
                continue
            
            product_info = product_lookup[canonical_id]
            product_comparison = {
                "canonical_id": canonical_id,
                "canonical_name": product_info["canonical_name"],
                "category": product_info["category"],
                "retailer_prices": []
            }
            
            # Find all retailer products for this canonical ID
            for catalog_item in catalog_data.get("retailer_products", []):
                if catalog_item.get("canonical_id") == canonical_id:
                    retailer_id = catalog_item.get("retailer_id")
                    retailer_product_id = catalog_item.get("retailer_product_id")
                    
                    # Filter by retailer if specified
                    if request.retailer_ids and retailer_id not in request.retailer_ids:
                        continue
                    
                    # Get price if available
                    if retailer_product_id in price_lookup:
                        price_info = price_lookup[retailer_product_id]
                        retailer_info = retailer_lookup.get(retailer_id, {})
                        
                        product_comparison["retailer_prices"].append({
                            "retailer_id": retailer_id,
                            "retailer_name": retailer_info.get("display_name", retailer_id),
                            "retailer_product_id": retailer_product_id,
                            "product_name": catalog_item.get("name", ""),
                            "price": price_info["price"],
                            "unit_price": price_info["unit_price"],
                            "unit_price_measure": price_info["unit_price_measure"]
                        })
            
            # Sort by price (ascending)
            product_comparison["retailer_prices"].sort(key=lambda x: x["price"])
            
            # Add best price info
            if product_comparison["retailer_prices"]:
                best_price = product_comparison["retailer_prices"][0]
                product_comparison["best_price"] = {
                    "retailer_id": best_price["retailer_id"],
                    "retailer_name": best_price["retailer_name"],
                    "price": best_price["price"]
                }
            
            comparisons.append(product_comparison)
        
        return PriceComparisonResponse(
            comparisons=comparisons,
            total_items=len(comparisons)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare prices: {str(e)}"
        )

@router.get("/search", response_model=PriceResponse, summary="Search prices")
async def search_prices(
    query: str = Query(..., description="Search query"),
    retailer_id: Optional[str] = Query(None, description="Filter by retailer"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter")
):
    """Search prices by product name or retailer product ID."""
    try:
        prices_data = load_json_data("price_snapshots.json")
        catalog_data = load_json_data("retailer_catalog.json")
        
        # Build product name lookup
        product_name_lookup = {}
        for catalog_item in catalog_data.get("retailer_products", []):
            product_name_lookup[catalog_item["retailer_product_id"]] = catalog_item["name"]
        
        matching_prices = []
        query_lower = query.lower()
        
        for price in prices_data.get("prices", []):
            retailer_product_id = price.get("retailer_product_id", "")
            
            # Filter by retailer if specified
            if retailer_id and not retailer_product_id.startswith(f"{retailer_id}:"):
                continue
            
            # Filter by price range if specified
            if min_price is not None and price.get("price", 0) < min_price:
                continue
            if max_price is not None and price.get("price", 0) > max_price:
                continue
            
            # Search in retailer product ID
            if query_lower in retailer_product_id.lower():
                matching_prices.append(PriceSnapshot(**price))
                continue
            
            # Search in product name
            product_name = product_name_lookup.get(retailer_product_id, "")
            if query_lower in product_name.lower():
                matching_prices.append(PriceSnapshot(**price))
                continue
        
        return PriceResponse(prices=matching_prices)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search prices: {str(e)}"
        )

@router.get("/stats/summary", summary="Get pricing statistics summary")
async def get_pricing_stats():
    """Get pricing statistics summary."""
    try:
        prices_data = load_json_data("price_snapshots.json")
        catalog_data = load_json_data("retailer_catalog.json")
        retailers_data = load_json_data("retailers.json")
        
        prices = prices_data.get("prices", [])
        retailers = retailers_data.get("retailers", [])
        
        # Basic stats
        total_products = len(prices)
        total_retailers = len(retailers)
        
        # Price range stats
        all_prices = [p["price"] for p in prices if "price" in p]
        min_price = min(all_prices) if all_prices else 0
        max_price = max(all_prices) if all_prices else 0
        avg_price = sum(all_prices) / len(all_prices) if all_prices else 0
        
        # Retailer stats
        retailer_stats = {}
        for retailer in retailers:
            retailer_id = retailer["retailer_id"]
            retailer_prices = [p["price"] for p in prices if p.get("retailer_product_id", "").startswith(f"{retailer_id}:")]
            
            if retailer_prices:
                retailer_stats[retailer_id] = {
                    "display_name": retailer["display_name"],
                    "product_count": len(retailer_prices),
                    "min_price": min(retailer_prices),
                    "max_price": max(retailer_prices),
                    "avg_price": sum(retailer_prices) / len(retailer_prices)
                }
        
        return {
            "summary": {
                "total_products": total_products,
                "total_retailers": total_retailers,
                "price_range": {
                    "min": min_price,
                    "max": max_price,
                    "average": avg_price
                }
            },
            "retailer_stats": retailer_stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get pricing stats: {str(e)}"
        )
