# 🛒 ShopLyft - AI Grocery Shopping Optimizer

[![GitHub](https://img.shields.io/badge/GitHub-AZN--Intelligence%2FShopLyft-blue?logo=github)](https://github.com/AZN-Intelligence/ShopLyft)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://python.org)
[![AI Framework](https://img.shields.io/badge/AI-ConnectOnion-orange)](https://connectonion.com)

An intelligent grocery shopping assistant that optimizes your shopping across **Woolworths**, **Coles**, and **ALDI** to maximize savings and minimize travel time. Built with advanced AI agent technology using the ConnectOnion framework.

## 🌟 Features
- **🤖 Hybrid AI Architecture**: Clear separation of AI parsing and algorithmic optimization
- **💰 Multi-Store Price Comparison**: Find the best deals across Australia's major supermarkets
- **🗺️ Smart Route Planning**: Traveling Salesman algorithm for optimal store visiting order
- **📱 Click & Collect Integration**: Automatic eligibility checking and cart optimization
- **🔒 Strict Data Mapping**: Only uses pre-existing stores and products from JSON data
- **📊 Savings Analysis**: Real-time calculation of savings vs single-store shopping
- **⚡ Natural Language Input**: Simple text input like "milk, bread, eggs, location: Sydney CBD"

## 🚀 How It Works

1. **Input**: Natural language shopping list + location
2. **AI Parsing**: LLM maps user input to pre-existing products in products.json
3. **Route Chooser**: Multi-part algorithmic optimization:
   - Generate price dataset from all JSON files
   - Generate all possible routes for all stores
   - Score routes based on time (20%) and price (80%)
   - Find optimal route with best score
4. **Output**: Complete shopping plan with store route, item assignments, and savings calculation

```
Input:  "Shopping list: milk, bread, eggs, bananas. Location: Sydney CBD"
Output: Optimized plan visiting 2-3 stores, saving $3-8, 25-35 minutes total time
```

## 🛠️ Technology Stack

- **AI Framework**: ConnectOnion for LLM-based natural language processing
- **Optimization**: Pure algorithmic approach with TSP and combinatorics
- **Data**: JSON database with strict mapping structure:
  - **products.json**: Product definitions and aliases for AI parsing
  - **stores.json**: Store locations and addresses for route planning
  - **price_snapshots.json**: Current prices for cost optimization
  - **retailer_catalog.json**: Product availability by retailer
  - **retailers.json**: Retailer rules (Click & Collect, etc.)
- **Language**: Python 3.8+ with comprehensive type hints and Pydantic models
- **Architecture**: Hybrid approach - AI for parsing, algorithms for optimization

## 🏗️ Architecture Overview

### Hybrid AI + Algorithms Approach
The ShopLyft agent uses a **clear separation of concerns**:

1. **AI Parsing (LLM)**: 
   - Maps natural language input to pre-existing products in `products.json`
   - Uses ConnectOnion's `llm_do` with Pydantic models for structured output
   - Strict validation ensures only valid canonical_ids are used

2. **Route Chooser (Pure Algorithms)**:
   - **Price Dataset**: Generates (item, price, store) combinations from all JSON files
   - **Route Generation**: Creates all possible store combinations using combinatorics
   - **Route Scoring**: Balances cost (80%) vs time (20%) using Haversine distance
   - **Optimal Route**: Selects best scoring route using TSP optimization

### Data Mapping Structure
- **products.json**: Product definitions and aliases for AI parsing
- **stores.json**: Store locations and addresses for route planning  
- **price_snapshots.json**: Current prices for cost optimization
- **retailer_catalog.json**: Product availability by retailer
- **retailers.json**: Retailer rules (Click & Collect, etc.)

## 📊 Performance Metrics

- **Average Savings**: 5-15% compared to single-store shopping
- **Coverage**: 15 stores across Sydney CBD and inner suburbs
- **Product Catalog**: 25 products across 5 major categories
- **Optimization Speed**: Complete plans generated in 15-30 seconds
- **Route Efficiency**: TSP algorithm for minimal travel time
- **Data Integrity**: Strict validation ensures only pre-existing stores/products are used

## 🏆 Hackathon Ready

- ✅ **Innovation**: Hybrid AI architecture with clear separation of concerns
- ✅ **Technical Complexity**: Multi-part route chooser with algorithmic optimization
- ✅ **User Experience**: Natural language input, human-readable output
- ✅ **Feasibility**: Production-ready architecture with strict data validation
- ✅ **Presentation**: Clean code, extensive documentation, demo-ready

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project was built for DevSoc Flagship Hackathon 2025. Contributions welcome!

---

# 👥 Team Setup Instructions

*This section is for our hackathon team members to get the project running locally.*

## 🔧 Local Development Setup

### Prerequisites
- Python 3.8 or higher
- Git installed
- Terminal/Command line access

### 1. Clone the Repository

```bash
git clone https://github.com/AZN-Intelligence/ShopLyft.git
cd ShopLyft
```

### 2. Install Dependencies

```bash
# Install ConnectOnion framework
pip install --user --break-system-packages connectonion

# Or if you prefer virtual environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install connectonion
```

### 3. Authentication Setup

```bash
# Authenticate with ConnectOnion (this sets up your API key automatically)
co auth
```

*Follow the prompts to authenticate. This will automatically configure your OpenOnion API key.*

### 4. Verify Installation

```bash
# Test the agent
python meta-agent/agent.py
```

### 5. Project Structure Overview

```
ShopLyft/
├── meta-agent/
│   ├── agent.py          # Main AI agent implementation
│   ├── prompt.md         # System prompt for the agent
│   ├── shoplyft_ai_agent.md # Agent specification
│   └── connectoniondocumentation.md # ConnectOnion framework docs
├── data/                 # JSON database with strict mapping
│   ├── products.json     # Product definitions and aliases for AI parsing
│   ├── stores.json       # Store locations and addresses for route planning
│   ├── price_snapshots.json # Current prices for cost optimization
│   ├── retailer_catalog.json # Product availability by retailer
│   ├── retailers.json    # Retailer rules (Click & Collect, etc.)
│   └── plans.json        # Generated shopping plans
├── frontend/             # React frontend (optional)
├── shoplyft_ai_agent_guide.md # Complete user guide
├── shoplyft_project_prompt.md # Project specification
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🧪 Testing the Agent

### Interactive Testing
```bash
python meta-agent/agent.py
```

Then try inputs like:
- `"Shopping list: milk, bread, eggs. Location: -33.871, 151.206"`
- `"Shopping list: pasta, sauce, cheese, chicken. Location: Sydney CBD"`
- `"Shopping list: apples, bananas, yogurt. Location: Bondi Junction"`

### Expected Output
The agent should return:
1. ✅ Valid Plan_v1 JSON structure
2. ✅ Human-readable markdown summary
3. ✅ Savings calculation vs single-store baseline
4. ✅ Store route optimization
5. ✅ Click & Collect eligibility

## 🐛 Troubleshooting

### Common Issues

**"ModuleNotFoundError: No module named 'connectonion'"**
```bash
pip install --user --break-system-packages connectonion
```

**"Authentication failed"**
```bash
co auth
# Follow the authentication flow again
```

**"Maximum iterations reached"**
- This is normal for complex shopping lists
- The agent will still return a valid plan

**"Items not found in catalog"**
- Check your spelling
- Try common aliases (e.g., "milk 2L" instead of "milk")

### Debug Mode
```bash
# Run with debug output
python -u meta-agent/agent.py
```

## 📝 Development Notes

### Configuration
- **Model**: `co/o4-mini` (managed by ConnectOnion)
- **Max iterations**: 8 (reduced since main work is in algorithms)
- **Optimization weights**: 20% time, 80% cost
- **Max stores**: 3 (Woolworths, Coles, ALDI)
- **Architecture**: Hybrid - AI for parsing, algorithms for optimization

### Key Files to Understand
1. `meta-agent/agent.py` - Main agent implementation with hybrid architecture
2. `meta-agent/prompt.md` - System instructions for the AI
3. `meta-agent/shoplyft_ai_agent.md` - Complete agent specification
4. `data/*.json` - Database with strict mapping structure
5. `shoplyft_ai_agent_guide.md` - Comprehensive user guide

### Making Changes
- **Add products**: Edit `data/products.json` and `data/retailer_catalog.json`
- **Add stores**: Edit `data/stores.json`
- **Modify pricing**: Edit `data/price_snapshots.json`
- **Change AI behavior**: Edit `meta-agent/prompt.md`
- **Update architecture**: Edit `meta-agent/agent.py` (hybrid AI + algorithms)

## ✅ Ready to Demo!

Once setup is complete, you should be able to:
- Run the agent locally
- Process shopping lists with location
- Get optimized shopping plans with savings
- Demonstrate route optimization across Sydney stores

**Need help?** Ask the team or check the comprehensive guide in `shoplyft_ai_agent_guide.md`!
