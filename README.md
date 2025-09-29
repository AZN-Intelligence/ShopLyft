# 🛒 ShopLyft - AI Grocery Shopping Optimizer

[![GitHub](https://img.shields.io/badge/GitHub-AZN--Intelligence%2FShopLyft-blue?logo=github)](https://github.com/AZN-Intelligence/ShopLyft)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://python.org)
[![AI Framework](https://img.shields.io/badge/AI-ConnectOnion-orange)](https://connectonion.com)

An intelligent grocery shopping assistant that optimizes your shopping across **Woolworths**, **Coles**, and **ALDI** to maximize savings and minimize travel time. Built with advanced AI agent technology using the ConnectOnion framework.

## 🌟 Features

- **🤖 AI-Powered Optimization**: Advanced AI agent with 18 specialized tools for intelligent decision making
- **💰 Multi-Store Price Comparison**: Find the best deals across Australia's major supermarkets
- **🗺️ Smart Route Planning**: Traveling Salesman algorithm for optimal store visiting order
- **📱 Click & Collect Integration**: Automatic eligibility checking and cart optimization
- **💡 Smart Substitutions**: Intelligent product matching with transparent substitution flagging
- **📊 Savings Analysis**: Real-time calculation of savings vs single-store shopping
- **⚡ Natural Language Input**: Simple text input like "milk, bread, eggs, location: Sydney CBD"

## 🚀 How It Works

1. **Input**: Natural language shopping list + location
2. **AI Processing**: 18 specialized tools analyze prices, locations, and optimization constraints
3. **Optimization**: Advanced algorithms balance cost savings (80%) vs time efficiency (20%)
4. **Output**: Complete shopping plan with store route, item assignments, and savings calculation

```
Input:  "Shopping list: milk, bread, eggs, bananas. Location: Sydney CBD"
Output: Optimized plan visiting 2-3 stores, saving $3-8, 25-35 minutes total time
```

## 🛠️ Technology Stack

- **AI Framework**: ConnectOnion for advanced agent capabilities
- **Optimization**: Traveling Salesman Problem (TSP) algorithms
- **Data**: Enhanced JSON database with 25 products across 13 Sydney stores
- **Language**: Python 3.8+ with comprehensive type hints
- **Architecture**: Function-based tools with automatic AI orchestration

## 📊 Performance Metrics

- **Average Savings**: 5-15% compared to single-store shopping
- **Coverage**: 13 stores across Sydney CBD and inner suburbs
- **Product Catalog**: 25 products across 5 major categories
- **Optimization Speed**: Complete plans generated in 15-30 seconds
- **Route Efficiency**: TSP algorithm for minimal travel time

## 🏆 Hackathon Ready

- ✅ **Innovation**: Advanced AI agent with sophisticated optimization
- ✅ **Technical Complexity**: 18 specialized tools, unit pricing, route optimization
- ✅ **User Experience**: Natural language input, human-readable output
- ✅ **Feasibility**: Production-ready architecture with comprehensive error handling
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

# Or run the simple test
python test_agent_simple.py
```

### 5. Project Structure Overview

```
ShopLyft/
├── meta-agent/
│   ├── agent.py          # Main AI agent implementation
│   ├── prompt.md         # System prompt for the agent
│   └── .co/              # ConnectOnion configuration
├── data/                 # JSON database
│   ├── retailers.json    # Retailer info and Click & Collect rules
│   ├── stores.json       # 13 stores across Sydney with locations
│   ├── products.json     # 25 products with categories and unit pricing
│   ├── retailer_catalog.json # Product mappings per retailer
│   ├── price_snapshots.json  # Prices with unit pricing for comparison
│   └── plans.json        # Generated shopping plans
├── test_agent_simple.py  # Simple test script
└── README.md            # This file
```

## 🧪 Testing the Agent

### Basic Test
```bash
python test_agent_simple.py
```

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
- **Max iterations**: 16 (sufficient for complex optimization)
- **Optimization weights**: 20% time, 80% cost
- **Max stores**: 3 (Woolworths, Coles, ALDI)

### Key Files to Understand
1. `meta-agent/agent.py` - Main agent implementation
2. `meta-agent/prompt.md` - System instructions for the AI
3. `data/*.json` - Database with products, stores, and pricing
4. `test_agent_simple.py` - Test script for validation

### Making Changes
- **Add products**: Edit `data/products.json` and `data/retailer_catalog.json`
- **Add stores**: Edit `data/stores.json`
- **Modify pricing**: Edit `data/price_snapshots.json`
- **Change AI behavior**: Edit `meta-agent/prompt.md`

## ✅ Ready to Demo!

Once setup is complete, you should be able to:
- Run the agent locally
- Process shopping lists with location
- Get optimized shopping plans with savings
- Demonstrate route optimization across Sydney stores

**Need help?** Ask the team or check the comprehensive guide in `shoplyft_ai_agent_guide.md`!
