# Pydantic models for ShopLyft API
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

# Enums
class UnitType(str, Enum):
    VOLUME = "volume"
    WEIGHT = "weight"
    COUNT = "count"

class UnitMeasure(str, Enum):
    LITER = "L"
    ML = "mL"
    KG = "kg"
    G = "g"
    PIECE = "piece"
    PACK = "pack"

# Product Models
class ProductAliases(BaseModel):
    aliases: List[str] = Field(..., description="List of alternative names for the product")

class Product(BaseModel):
    canonical_id: str = Field(..., description="Unique identifier for the product")
    canonical_name: str = Field(..., description="Official name of the product")
    category: str = Field(..., description="Product category")
    unit_type: UnitType = Field(..., description="Type of unit measurement")
    unit_size: float = Field(..., description="Size of the unit")
    unit_measure: UnitMeasure = Field(..., description="Unit of measurement")
    aliases: List[str] = Field(..., description="List of alternative names")

class ProductResponse(BaseModel):
    products: List[Product]

class ProductSearchRequest(BaseModel):
    query: str = Field(..., description="Search query for products")
    category: Optional[str] = Field(None, description="Filter by category")

class ProductSearchResponse(BaseModel):
    products: List[Product]
    total_count: int

# Store Models
class Location(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")

class OpeningHours(BaseModel):
    day: str = Field(..., description="Day of the week")
    open: str = Field(..., description="Opening time")
    close: str = Field(..., description="Closing time")

class Store(BaseModel):
    store_id: str = Field(..., description="Unique store identifier")
    retailer_id: str = Field(..., description="Retailer identifier")
    name: str = Field(..., description="Store name")
    address: str = Field(..., description="Store address")
    suburb: str = Field(..., description="Suburb")
    postcode: str = Field(..., description="Postal code")
    location: Location = Field(..., description="Store coordinates")
    opening_hours: List[OpeningHours] = Field(..., description="Store opening hours")

class StoreResponse(BaseModel):
    stores: List[Store]

class StoreSearchRequest(BaseModel):
    location: Optional[Location] = Field(None, description="Search near this location")
    retailer_id: Optional[str] = Field(None, description="Filter by retailer")
    suburb: Optional[str] = Field(None, description="Filter by suburb")

class StoreSearchResponse(BaseModel):
    stores: List[Store]
    total_count: int

# Pricing Models
class PriceSnapshot(BaseModel):
    retailer_product_id: str = Field(..., description="Retailer-specific product ID")
    price: float = Field(..., description="Current price")
    unit_price: float = Field(..., description="Price per unit")
    unit_price_measure: str = Field(..., description="Unit price measurement")

class PriceResponse(BaseModel):
    prices: List[PriceSnapshot]

class PriceComparisonRequest(BaseModel):
    canonical_ids: List[str] = Field(..., description="List of product canonical IDs to compare")
    retailer_ids: Optional[List[str]] = Field(None, description="Filter by specific retailers")

class PriceComparisonResponse(BaseModel):
    comparisons: List[Dict[str, Any]]
    total_items: int

# Retailer Models
class ClickCollect(BaseModel):
    min_spend: float = Field(..., description="Minimum spend for click & collect")
    currency: str = Field(..., description="Currency")

class Retailer(BaseModel):
    retailer_id: str = Field(..., description="Retailer identifier")
    display_name: str = Field(..., description="Display name")
    click_collect: ClickCollect = Field(..., description="Click & collect rules")

class RetailerResponse(BaseModel):
    retailers: List[Retailer]

# Retailer Catalog Models
class RetailerProduct(BaseModel):
    retailer_product_id: str = Field(..., description="Retailer-specific product ID")
    retailer_id: str = Field(..., description="Retailer identifier")
    canonical_id: str = Field(..., description="Canonical product ID")
    name: str = Field(..., description="Product name at retailer")

class RetailerCatalogResponse(BaseModel):
    retailer_products: List[RetailerProduct]

# Optimization Models
class ParsedProduct(BaseModel):
    canonical_id: str = Field(..., description="Canonical product ID")
    canonical_name: str = Field(..., description="Product name")
    requested_item: str = Field(..., description="Original requested item")
    quantity: int = Field(default=1, description="Requested quantity")
    confidence: float = Field(..., description="Parsing confidence score")

class ShoppingListRequest(BaseModel):
    grocery_list: str = Field(..., description="Natural language grocery list")
    location: str = Field(..., description="Starting location")
    max_stores: int = Field(default=3, description="Maximum number of stores to visit")
    time_weight: float = Field(default=0.2, description="Weight for time optimization")
    price_weight: float = Field(default=0.8, description="Weight for price optimization")

class ShoppingListResponse(BaseModel):
    parsed_products: List[ParsedProduct]
    unmatched_items: List[str]
    parsing_confidence: float

class RouteStore(BaseModel):
    store_id: str
    retailer_id: str
    name: str
    address: str
    suburb: str
    postcode: str
    location: Location

class RouteItem(BaseModel):
    item_requested: str
    product_name: str
    quantity: int
    unit_price: float
    line_total: float

class StoreBasket(BaseModel):
    store_info: RouteStore
    items: List[RouteItem]
    subtotal: float
    click_collect_eligible: bool
    min_spend_required: float

class ShoppingPlan(BaseModel):
    plan_id: Optional[str] = Field(None, description="Unique plan identifier")
    total_cost: float = Field(..., description="Total cost of the plan")
    total_time: float = Field(..., description="Total time in minutes")
    travel_time: float = Field(..., description="Travel time in minutes")
    shopping_time: float = Field(..., description="Shopping time in minutes")
    num_stores: int = Field(..., description="Number of stores to visit")
    route_score: float = Field(..., description="Optimization score")
    store_baskets: List[StoreBasket] = Field(..., description="Items organized by store")
    generated_at: Optional[datetime] = Field(None, description="Plan generation timestamp")

class OptimizationRequest(BaseModel):
    grocery_list: str = Field(..., description="Natural language grocery list")
    location: str = Field(..., description="Starting location")
    max_stores: int = Field(default=3, description="Maximum number of stores to visit")
    time_weight: float = Field(default=0.2, description="Weight for time optimization")
    price_weight: float = Field(default=0.8, description="Weight for price optimization")

class OptimizationResponse(BaseModel):
    plan: ShoppingPlan
    success: bool = Field(..., description="Whether optimization was successful")
    message: Optional[str] = Field(None, description="Additional information")

# Plan Management Models
class PlanEntry(BaseModel):
    plan_id: str = Field(..., description="Unique plan identifier")
    generated_at: datetime = Field(..., description="Plan generation timestamp")
    payload: Union[Dict[str, Any], str] = Field(..., description="Plan data (can be dict or string for legacy compatibility)")

class PlanResponse(BaseModel):
    plans: List[PlanEntry]

class PlanSaveRequest(BaseModel):
    plan_data: ShoppingPlan = Field(..., description="Shopping plan to save")

class PlanSaveResponse(BaseModel):
    plan_id: str = Field(..., description="Generated plan ID")
    message: str = Field(..., description="Success message")

# Error Models
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    status_code: int = Field(..., description="HTTP status code")

# Health Check Model
class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(..., description="Current timestamp")
    version: str = Field(..., description="API version")
