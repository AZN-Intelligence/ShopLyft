# 🛒 ShopLyft - AI Grocery Shopping Optimizer

ShopLyft is an AI-powered grocery shopping assistant that optimizes your shopping across Woolworths, Coles, and ALDI to save time and money. Built with the ConnectOnion framework for advanced AI agent capabilities.

## Features

- **Multi-store optimization**: Find the best combination of stores to visit
- **Price comparison**: Compare prices across all major Australian supermarkets
- **Route optimization**: Minimize travel time between stores
- **Click & Collect integration**: Automatic eligibility checking with minimum spend requirements
- **Savings calculation**: Shows total savings compared to shopping at a single store
- **Smart substitutions**: Handles product substitutions with clear flagging
- **ConnectOnion AI Agent**: Advanced AI reasoning with 18 specialized tools

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install --user --break-system-packages connectonion
   ```

2. **Authenticate with ConnectOnion**:
   ```bash
   /Users/kenzee/Library/Python/3.13/bin/co auth
   ```
   (This will set up your OpenOnion API key automatically)

3. **Run the agent**:
   ```bash
   python3 meta-agent/agent.py
   ```

4. **Test the agent**:
   ```bash
   python3 test_agent_simple.py
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
│   ├── agent.py          # Main AI agent implementation (714 lines)
│   ├── prompt.md         # System prompt for the agent
│   └── .co/              # ConnectOnion configuration
│       └── config.toml   # Agent configuration
├── data/                 # Mock JSON database
│   ├── retailers.json    # Retailer info and Click & Collect rules
│   ├── stores.json       # Store locations and hours
│   ├── products.json     # Product catalog with aliases
│   ├── retailer_catalog.json # Product mappings per retailer
│   ├── price_snapshots.json  # Current prices
│   └── plans.json        # Generated shopping plans
├── test_agent_simple.py  # Simple test script
├── .env                  # Environment variables (API keys)
├── .gitignore           # Git ignore rules
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
- **Model**: `co/o4-mini` (ConnectOnion managed model)
- **Max iterations**: 16 (sufficient for complex optimization)
- **Optimization weights**: 20% time, 80% cost (configurable)
- **Max stores**: 3 (Woolworths, Coles, ALDI)
- **Currency**: AUD
- **Timezone**: Australia/Sydney
- **Authentication**: OpenOnion API key (auto-configured)

## ConnectOnion Integration

This project uses the ConnectOnion framework for:
- **AI Agent Management**: Advanced reasoning and tool orchestration
- **API Key Management**: Automatic authentication with OpenOnion
- **Model Access**: Managed access to `co/o4-mini` model
- **Behavior Tracking**: Built-in logging and monitoring
- **Tool Integration**: Seamless function calling and execution

## Test Results

✅ **Successfully Tested**: The agent processes shopping lists and returns optimized plans:
```
Input: Shopping list: milk, bread, eggs. Location: -33.871, 151.206 (Sydney CBD)
Output: Complete optimized plan with store selection, pricing, and route optimization
```

## Hackathon Compliance

- ✅ Uses mock JSON data only (no live scraping)
- ✅ All code in public GitHub repository
- ✅ ConnectOnion framework for AI agent
- ✅ Comprehensive optimization algorithms
- ✅ Fully functional and tested
- ✅ Ready for demo and pitch

## GitHub Repository

View the complete source code: [https://github.com/AZN-Intelligence/ShopLyft.git](https://github.com/AZN-Intelligence/ShopLyft.git)

## Next Steps

This is the core AI agent setup. For a complete application, you would also need:
- FastAPI backend with REST endpoints
- React frontend for user interface
- Enhanced optimization algorithms
- Real-time price data integration
