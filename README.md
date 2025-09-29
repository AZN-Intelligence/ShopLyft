# 🛒 ShopLyft - AI Grocery Shopping Optimizer

ShopLyft is an AI-powered grocery shopping assistant that optimizes your shopping across Woolworths, Coles, and ALDI to save time and money.

## Features

- **Multi-store optimization**: Find the best combination of stores to visit
- **Price comparison**: Compare prices across all major Australian supermarkets
- **Route optimization**: Minimize travel time between stores
- **Click & Collect integration**: Automatic eligibility checking with minimum spend requirements
- **Savings calculation**: Shows total savings compared to shopping at a single store
- **Smart substitutions**: Handles product substitutions with clear flagging

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Run the agent**:
   ```bash
   python meta-agent/agent.py
   ```

4. **Test the agent**:
   ```bash
   python test_agent.py
   ```

## Usage Example

```
You: Shopping list: milk, bread, eggs, bananas. Location: -33.871, 151.206

Agent: [Generates optimized shopping plan with:
- Store route optimization
- Item assignments per store
- Click & Collect eligibility
- Total savings calculation
- Travel time estimates]
```

## Project Structure

```
Shoplyft/
├── meta-agent/
│   ├── agent.py          # Main AI agent implementation
│   └── prompt.md         # System prompt for the agent
├── data/                 # Mock JSON database
│   ├── retailers.json    # Retailer info and Click & Collect rules
│   ├── stores.json       # Store locations and hours
│   ├── products.json     # Product catalog with aliases
│   ├── retailer_catalog.json # Product mappings per retailer
│   ├── price_snapshots.json  # Current prices
│   └── plans.json        # Generated shopping plans
├── test_agent.py         # Simple test script
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## AI Agent Tools

The agent uses **18 specialized tools** to optimize your shopping:

### Core Data Tools
- `fetch_prices()` - Get prices for items across stores
- `store_locator()` - Find nearby stores for each retailer
- `distance_matrix()` - Calculate travel times between locations
- `clickcollect_rules()` - Check Click & Collect eligibility
- `cart_bridge()` - Create carts for each retailer
- `persist_plan()` - Save the generated shopping plan
- `log_event()` - Track optimization steps

### Core Planning Functions
- `normalize_shopping_list()` - Convert raw text to canonical product IDs
- `match_candidates()` - Find product options per retailer
- `build_initial_assignment()` - Assign items to cheapest stores
- `apply_max_store_cap()` - Limit number of stores in route
- `rebalance_for_min_spend()` - Optimize for Click & Collect eligibility
- `tsp_order()` - Traveling Salesman route optimization
- `score_plan()` - Calculate weighted cost/time score

### Helper Functions
- `candidate_stores()` - Get nearby stores for retailers
- `compute_single_store_baseline()` - Calculate single-store comparison
- `compute_totals()` - Generate final cost/time totals
- `assemble_plan_json()` - Build Plan_v1 JSON structure
- `render_human_summary()` - Create markdown summary

## Configuration

The agent is configured with:
- **Max iterations**: 16 (sufficient for complex optimization)
- **Optimization weights**: 20% time, 80% cost (configurable)
- **Max stores**: 3 (Woolworths, Coles, ALDI)
- **Currency**: AUD
- **Timezone**: Australia/Sydney

## Hackathon Compliance

- ✅ Uses mock JSON data only (no live scraping)
- ✅ All code in public repository
- ✅ ConnectOnion framework for AI agent
- ✅ Comprehensive optimization algorithms
- ✅ Ready for demo and pitch

## Next Steps

This is the core AI agent setup. For a complete application, you would also need:
- FastAPI backend with REST endpoints
- React frontend for user interface
- Enhanced optimization algorithms
- Real-time price data integration
