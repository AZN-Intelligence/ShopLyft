# ShopLyft FastAPI Documentation

This document describes the FastAPI implementation of the ShopLyft grocery shopping optimization service.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the API Server
```bash
python start_api.py
```

Or manually:
```bash
python main.py
```

### 3. Access the API
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Base URL**: http://localhost:8000

## 📋 API Endpoints Overview

### Core Services

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Products** | `/api/v1/products` | Product catalog management |
| **Stores** | `/api/v1/stores` | Store information and location services |
| **Pricing** | `/api/v1/pricing` | Price snapshots and comparisons |
| **Optimization** | `/api/v1/optimization` | Shopping plan generation |
| **Plans** | `/api/v1/plans` | Plan management and storage |

### Health & Info
- `GET /health` - Service health check
- `GET /api/v1/info` - API information and features

## 🔧 API Endpoints Detail

### Products API (`/api/v1/products`)

**Get all products**
```http
GET /api/v1/products
```

**Search products**
```http
GET /api/v1/products/search?query=milk&category=dairy
```

**Get product by ID**
```http
GET /api/v1/products/{canonical_id}
```

**Get products by category**
```http
GET /api/v1/products/category/{category}
```

**Advanced search**
```http
POST /api/v1/products/search
Content-Type: application/json

{
  "query": "milk",
  "category": "dairy"
}
```

### Stores API (`/api/v1/stores`)

**Get all stores**
```http
GET /api/v1/stores
```

**Search stores by location**
```http
GET /api/v1/stores/search?lat=-33.871&lng=151.206&radius_km=5
```

**Get store by ID**
```http
GET /api/v1/stores/{store_id}
```

**Get stores by retailer**
```http
GET /api/v1/stores/retailer/{retailer_id}
```

**Parse location string**
```http
GET /api/v1/stores/location/parse?location_input=Sydney CBD
```

### Pricing API (`/api/v1/pricing`)

**Get all prices**
```http
GET /api/v1/pricing
```

**Get price by product**
```http
GET /api/v1/pricing/product/{retailer_product_id}
```

**Compare prices**
```http
POST /api/v1/pricing/compare
Content-Type: application/json

{
  "canonical_ids": ["milk-fullcream-2l", "bread-white-loaf"],
  "retailer_ids": ["woolworths", "coles"]
}
```

**Get pricing statistics**
```http
GET /api/v1/pricing/stats/summary
```

### Optimization API (`/api/v1/optimization`)

**Parse shopping list**
```http
POST /api/v1/optimization/parse
Content-Type: application/json

{
  "grocery_list": "milk, bread, eggs",
  "location": "Sydney CBD"
}
```

**Generate optimized shopping plan**
```http
POST /api/v1/optimization/optimize
Content-Type: application/json

{
  "grocery_list": "milk, bread, eggs, bananas",
  "location": "Sydney CBD",
  "max_stores": 3,
  "time_weight": 0.2,
  "price_weight": 0.8
}
```

**Get optimization service status**
```http
GET /api/v1/optimization/status
```

### Plans API (`/api/v1/plans`)

**Get all saved plans**
```http
GET /api/v1/plans
```

**Save a shopping plan**
```http
POST /api/v1/plans/save
Content-Type: application/json

{
  "plan_data": {
    "total_cost": 25.50,
    "total_time": 45.0,
    "travel_time": 20.0,
    "shopping_time": 25.0,
    "num_stores": 2,
    "route_score": 0.15,
    "store_baskets": [...]
  }
}
```

**Get plan by ID**
```http
GET /api/v1/plans/{plan_id}
```

**Delete a plan**
```http
DELETE /api/v1/plans/{plan_id}
```

**Get recent plans**
```http
GET /api/v1/plans/search/recent?limit=10
```

## 📊 Response Models

### Shopping Plan Response
```json
{
  "plan": {
    "plan_id": "plan_000001",
    "total_cost": 25.50,
    "total_time": 45.0,
    "travel_time": 20.0,
    "shopping_time": 25.0,
    "num_stores": 2,
    "route_score": 0.15,
    "store_baskets": [
      {
        "store_info": {
          "store_id": "woolworths:nsw:1234",
          "retailer_id": "woolworths",
          "name": "Woolworths Town Hall",
          "address": "456 George Street, Sydney NSW 2000",
          "suburb": "Sydney",
          "postcode": "2000",
          "location": {
            "lat": -33.871,
            "lng": 151.206
          }
        },
        "items": [
          {
            "item_requested": "milk",
            "product_name": "Woolworths Full Cream Milk 2L",
            "quantity": 1,
            "unit_price": 3.60,
            "line_total": 3.60
          }
        ],
        "subtotal": 3.60,
        "click_collect_eligible": false,
        "min_spend_required": 50.0
      }
    ],
    "generated_at": "2024-01-15T10:30:00Z"
  },
  "success": true,
  "message": "Optimized plan generated with 4 items across 2 stores"
}
```

## 🔍 Example Usage

### Complete Shopping Optimization Workflow

1. **Parse shopping list**:
```bash
curl -X POST "http://localhost:8000/api/v1/optimization/parse" \
  -H "Content-Type: application/json" \
  -d '{"grocery_list": "milk, bread, eggs, bananas", "location": "Sydney CBD"}'
```

2. **Generate optimized plan**:
```bash
curl -X POST "http://localhost:8000/api/v1/optimization/optimize" \
  -H "Content-Type: application/json" \
  -d '{"grocery_list": "milk, bread, eggs, bananas", "location": "Sydney CBD", "max_stores": 3}'
```

3. **Save the plan**:
```bash
curl -X POST "http://localhost:8000/api/v1/plans/save" \
  -H "Content-Type: application/json" \
  -d '{"plan_data": {...}}'
```

## 🛠️ Configuration

### Environment Variables
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `LOG_LEVEL`: Logging level (default: info)

### Data Files Required
The API requires these JSON files in the `data/` directory:
- `products.json` - Product catalog
- `stores.json` - Store locations
- `price_snapshots.json` - Current prices
- `retailer_catalog.json` - Product availability
- `retailers.json` - Retailer rules
- `plans.json` - Saved plans (created automatically)

## 🔒 Error Handling

The API returns structured error responses:

```json
{
  "error": "Product not found",
  "detail": "Product with ID 'invalid-id' not found",
  "status_code": 404
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### API Status
```bash
curl http://localhost:8000/api/v1/optimization/status
```

### Interactive Testing
Visit http://localhost:8000/docs for the interactive Swagger UI where you can test all endpoints directly.

## 📝 Development Notes

### Architecture
- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and serialization
- **ConnectOnion**: AI/LLM integration for natural language processing
- **Pure Algorithms**: Route optimization using TSP and combinatorics

### Key Features
- **Hybrid AI Architecture**: AI for parsing, algorithms for optimization
- **Strict Data Validation**: Only uses pre-existing stores and products
- **Comprehensive Error Handling**: Structured error responses
- **Interactive Documentation**: Auto-generated Swagger UI
- **Type Safety**: Full type hints and Pydantic models

### Performance
- **Optimization Speed**: Complete plans generated in 15-30 seconds
- **Route Efficiency**: TSP algorithm for minimal travel time
- **Data Integrity**: Strict validation ensures only valid data is used

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper type hints
3. Include comprehensive error handling
4. Update this documentation for new endpoints
5. Test all endpoints before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
