# Products API Router
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from pathlib import Path

from api.models import (
    Product, ProductResponse, ProductSearchRequest, ProductSearchResponse,
    ErrorResponse
)

router = APIRouter()

def load_json_data(filename: str) -> dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@router.get("/", response_model=ProductResponse, summary="Get all products")
async def get_all_products():
    """Get all products from the catalog."""
    try:
        products_data = load_json_data("products.json")
        products = [Product(**product) for product in products_data.get("products", [])]
        return ProductResponse(products=products)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load products: {str(e)}"
        )

@router.get("/search", response_model=ProductSearchResponse, summary="Search products")
async def search_products(
    query: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Search products by name, aliases, or category."""
    try:
        products_data = load_json_data("products.json")
        all_products = products_data.get("products", [])
        
        # Filter by category if specified
        if category:
            all_products = [p for p in all_products if p.get("category", "").lower() == category.lower()]
        
        # Search in product names and aliases
        query_lower = query.lower()
        matching_products = []
        
        for product in all_products:
            # Check canonical name
            if query_lower in product.get("canonical_name", "").lower():
                matching_products.append(Product(**product))
                continue
            
            # Check aliases
            aliases = product.get("aliases", [])
            if any(query_lower in alias.lower() for alias in aliases):
                matching_products.append(Product(**product))
                continue
        
        return ProductSearchResponse(
            products=matching_products,
            total_count=len(matching_products)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search products: {str(e)}"
        )

@router.get("/categories", summary="Get all product categories")
async def get_categories():
    """Get all available product categories."""
    try:
        products_data = load_json_data("products.json")
        categories = set()
        
        for product in products_data.get("products", []):
            category = product.get("category")
            if category:
                categories.add(category)
        
        return {"categories": sorted(list(categories))}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load categories: {str(e)}"
        )

@router.get("/{canonical_id}", response_model=Product, summary="Get product by ID")
async def get_product_by_id(canonical_id: str):
    """Get a specific product by its canonical ID."""
    try:
        products_data = load_json_data("products.json")
        
        for product in products_data.get("products", []):
            if product.get("canonical_id") == canonical_id:
                return Product(**product)
        
        raise HTTPException(
            status_code=404,
            detail=f"Product with ID '{canonical_id}' not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load product: {str(e)}"
        )

@router.get("/category/{category}", response_model=ProductResponse, summary="Get products by category")
async def get_products_by_category(category: str):
    """Get all products in a specific category."""
    try:
        products_data = load_json_data("products.json")
        products = []
        
        for product in products_data.get("products", []):
            if product.get("category", "").lower() == category.lower():
                products.append(Product(**product))
        
        return ProductResponse(products=products)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load products by category: {str(e)}"
        )

@router.post("/search", response_model=ProductSearchResponse, summary="Advanced product search")
async def advanced_product_search(request: ProductSearchRequest):
    """Advanced product search with structured request."""
    try:
        products_data = load_json_data("products.json")
        all_products = products_data.get("products", [])
        
        # Filter by category if specified
        if request.category:
            all_products = [p for p in all_products if p.get("category", "").lower() == request.category.lower()]
        
        # Search in product names and aliases
        query_lower = request.query.lower()
        matching_products = []
        
        for product in all_products:
            # Check canonical name
            if query_lower in product.get("canonical_name", "").lower():
                matching_products.append(Product(**product))
                continue
            
            # Check aliases
            aliases = product.get("aliases", [])
            if any(query_lower in alias.lower() for alias in aliases):
                matching_products.append(Product(**product))
                continue
        
        return ProductSearchResponse(
            products=matching_products,
            total_count=len(matching_products)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search products: {str(e)}"
        )
