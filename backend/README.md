# ShopLyft Backend API

FastAPI-based backend service for AI-powered grocery shopping optimization across Australian supermarkets.

## 🏗 Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── start_api.py         # Server startup script with configuration
├── requirements.txt     # Python dependencies
├── .venv/              # Virtual environment (created during setup)
└── api/
    ├── models.py        # Pydantic data models and schemas
    └── routers/
        ├── optimization.py  # Shopping plan optimization endpoints
        ├── products.py     # Product catalog management
        ├── stores.py       # Store location and search services
        ├── pricing.py      # Price comparison and snapshots
        └── plans.py        # Shopping plan storage and management
```

## 🚀 Setup & Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### 1. Environment Setup

Create and activate a virtual environment:

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# Optional: Install additional development tools
pip install pytest black flake8
```

### 3. Start the Server

```bash
# Using the startup script (recommended)
python start_api.py

# Or directly with uvicorn
python main.py

# Or with uvicorn command directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Verify Installation

Check that the server is running by visiting:

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **API Info**: http://localhost:8000/api/v1/info

### 5. Deactivate Environment

When finished, deactivate the virtual environment:

```bash
deactivate
```

## 📋 API Routes Overview

### 🎯 Optimization Routes (`/api/v1/optimization`)

Core AI-powered shopping optimization functionality.

| Method | Endpoint    | Description                                                   |
| ------ | ----------- | ------------------------------------------------------------- |
| `POST` | `/parse`    | Parse natural language shopping list into structured products |
| `POST` | `/optimize` | Generate optimized shopping plan with route and pricing       |
| `GET`  | `/status`   | Get optimization service status                               |

**Key Features:**

- Natural language processing for shopping lists
- Multi-store route optimization
- Price vs. time trade-off analysis
- Location-based store selection

### 🏪 Store Routes (`/api/v1/stores`)

Store location services and search functionality.

| Method | Endpoint                  | Description                                        |
| ------ | ------------------------- | -------------------------------------------------- |
| `GET`  | `/`                       | Get all available stores                           |
| `GET`  | `/search`                 | Search stores by location, retailer, or suburb     |
| `GET`  | `/retailers`              | Get all supported retailers                        |
| `GET`  | `/suburbs`                | Get all available suburbs                          |
| `GET`  | `/{store_id}`             | Get specific store details                         |
| `GET`  | `/retailer/{retailer_id}` | Get stores by retailer (Woolworths, Coles, ALDI)   |
| `GET`  | `/suburb/{suburb}`        | Get stores in specific suburb                      |
| `POST` | `/nearby`                 | Find stores near coordinates with radius filtering |
| `GET`  | `/location/parse`         | Parse location string to coordinates               |

**Key Features:**

- Geospatial search with distance calculation
- Retailer-specific filtering
- Location parsing and geocoding
- Opening hours and store details

### 🛒 Product Routes (`/api/v1/products`)

Product catalog management and search services.

| Method | Endpoint               | Description                                     |
| ------ | ---------------------- | ----------------------------------------------- |
| `GET`  | `/`                    | Get all products in catalog                     |
| `GET`  | `/search`              | Search products by name or description          |
| `GET`  | `/categories`          | Get all product categories                      |
| `GET`  | `/{canonical_id}`      | Get specific product details                    |
| `GET`  | `/category/{category}` | Get products by category                        |
| `POST` | `/search`              | Advanced product search with structured filters |

**Key Features:**

- Fuzzy text search with aliases
- Category-based filtering
- Canonical product identification
- Unit standardization (weight, volume, count)

### 💰 Pricing Routes (`/api/v1/pricing`)

Price comparison and snapshot management.

| Method | Endpoint                         | Description                                 |
| ------ | -------------------------------- | ------------------------------------------- |
| `GET`  | `/`                              | Get all current price snapshots             |
| `GET`  | `/product/{retailer_product_id}` | Get price for specific retailer product     |
| `GET`  | `/retailer/{retailer_id}`        | Get all prices for specific retailer        |
| `GET`  | `/canonical/{canonical_id}`      | Get prices across all retailers for product |
| `POST` | `/compare`                       | Compare prices for multiple products        |
| `GET`  | `/search`                        | Search prices with filters                  |
| `GET`  | `/stats/summary`                 | Get pricing statistics and trends           |

**Key Features:**

- Cross-retailer price comparison
- Historical price tracking
- Bulk price analysis
- Statistical summaries and trends

### 📋 Plans Routes (`/api/v1/plans`)

Shopping plan storage and management system.

| Method   | Endpoint            | Description                  |
| -------- | ------------------- | ---------------------------- |
| `GET`    | `/`                 | Get all saved shopping plans |
| `GET`    | `/{plan_id}`        | Get specific plan details    |
| `POST`   | `/save`             | Save optimized shopping plan |
| `DELETE` | `/{plan_id}`        | Delete saved plan            |
| `GET`    | `/search/recent`    | Get recently created plans   |
| `GET`    | `/stats/summary`    | Get plans statistics         |
| `GET`    | `/export/{plan_id}` | Export plan as JSON          |
| `POST`   | `/import`           | Import plan from JSON        |
| `GET`    | `/search/by-cost`   | Search plans by cost range   |
| `GET`    | `/search/by-stores` | Search plans by store count  |

**Key Features:**

- Plan persistence and retrieval
- Search and filtering capabilities
- Import/export functionality
- Usage analytics and statistics

## 🔧 Core Features

### AI-Powered Optimization

- **Natural Language Processing**: Converts shopping lists to structured data
- **Multi-Objective Optimization**: Balances cost, time, and convenience
- **Route Planning**: Calculates optimal store visiting order
- **Location Intelligence**: Uses geospatial data for store selection

### Data Management

- **Product Catalog**: Standardized product database with aliases
- **Store Network**: Comprehensive Australian supermarket locations
- **Price Tracking**: Real-time price snapshots across retailers
- **Plan Storage**: Persistent shopping plan management

### Integration Ready

- **RESTful API**: Standard HTTP endpoints with JSON responses
- **OpenAPI Documentation**: Auto-generated interactive docs
- **CORS Support**: Cross-origin requests for web frontend
- **Error Handling**: Comprehensive error responses and logging

## 📊 Data Models

### Core Entities

- **Products**: Canonical products with aliases and unit standardization
- **Stores**: Physical locations with coordinates and opening hours
- **Prices**: Time-stamped price snapshots by retailer
- **Plans**: Optimized shopping plans with routes and baskets

### Supported Retailers

- **Woolworths**: Australia's largest supermarket chain
- **Coles**: Major competitor with extensive network
- **ALDI**: Discount retailer with growing presence

## 🛡 API Standards

### Response Format

- **Success**: Standard JSON with data payload
- **Errors**: Structured error responses with codes
- **Pagination**: Limit/offset for large datasets
- **Validation**: Pydantic models for request/response validation

### Performance

- **Async Operations**: Non-blocking request handling
- **Caching**: Optimized data retrieval
- **Batch Processing**: Efficient multi-item operations
- **Streaming**: Large dataset handling

## 🔍 Health & Monitoring

### Health Endpoints

- `/health` - Service health status
- `/api/v1/info` - API information and features
- Router-specific status endpoints for service monitoring

### Logging

- Structured logging with request tracing
- Performance metrics and timing
- Error tracking and debugging information

## 🛠 Troubleshooting

### Common Setup Issues

**Virtual Environment Issues:**

```bash
# If venv creation fails, try:
python3 -m venv .venv

# If activation fails on macOS/Linux:
chmod +x .venv/bin/activate
source .venv/bin/activate
```

**Dependency Installation Issues:**

```bash
# Update pip first:
pip install --upgrade pip

# Install dependencies with verbose output:
pip install -r requirements.txt -v

# If specific packages fail, install individually:
pip install fastapi uvicorn pydantic
```

**Server Startup Issues:**

```bash
# Check if port 8000 is already in use:
lsof -i :8000

# Use a different port:
uvicorn main:app --port 8001

# Check Python version:
python --version  # Should be 3.8+
```

**Permission Issues:**

```bash
# On macOS/Linux, ensure proper permissions:
chmod +x start_api.py

# Run with explicit python path:
python3 start_api.py
```

### Development Tips

**Hot Reload:**
The server automatically reloads when code changes are detected (using `--reload` flag).

**API Testing:**

- Use the interactive docs at `/docs` for testing endpoints
- Install HTTPie for command-line testing: `pip install httpie`
- Example: `http GET localhost:8000/health`

**Environment Variables:**
Create a `.env` file in the backend directory for configuration:

```bash
# .env
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=info
```
