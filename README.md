# ShopLyft - AI-Powered Grocery Shopping Optimization

> **Transform your grocery shopping with AI-powered route optimization and automated cart management across Australian supermarkets.**

ShopLyft is a comprehensive platform that combines natural language processing, route optimization, and browser automation to revolutionize grocery shopping. Simply input your shopping list, and ShopLyft will find the best stores, optimize your route, and even add items to your cart automatically.

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd ShopLyft

# Run the automated setup script
./setup.sh
```

The setup script will:

- ✅ Check all prerequisites (Python 3.8+, Node.js 16+, npm, git)
- ✅ Configure API keys interactively (OpenAI, Google Maps)
- ✅ Set up backend with virtual environment and connectonion
- ✅ Install frontend dependencies and configure environment
- ✅ Create startup scripts for easy development
- ✅ Test all installations and provide next steps

### Manual Setup

If you prefer manual setup, see the individual README files:

- [Backend Setup](./backend/README.md) - FastAPI server with AI optimization
- [Frontend Setup](./frontend/README.md) - React web application
- [Extension Setup](./extension/README.md) - Chrome browser extension

## 🏗 Architecture Overview

```
ShopLyft Platform
├── 🌐 Frontend (React + TypeScript)     # User interface and shopping experience
├── 📡 Backend (FastAPI + Python)       # AI optimization and API services
└── 🔌 Extension (Chrome Extension)      # Automated cart management
```

### Core Components

- **🤖 AI-Powered Optimization**: Natural language processing converts shopping lists to optimized routes
- **🗺 Route Planning**: Multi-store optimization balancing cost, time, and convenience
- **🛒 Cart Automation**: Browser extension automatically adds items across retailer websites
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🎯 Features

### For Shoppers

- **Natural Language Input**: Write shopping lists in plain English
- **Smart Route Optimization**: Find the best combination of stores and routes
- **Real-Time Savings**: See cost comparisons and savings opportunities
- **One-Click Cart Management**: Automatically add all items to retailer carts
- **Mobile-Friendly**: Optimized experience across all devices

### For Developers

- **Modern Tech Stack**: React 19, FastAPI, TypeScript, TailwindCSS
- **AI Integration**: OpenAI-powered natural language processing
- **Geospatial Services**: Google Maps integration for route visualization
- **Browser Automation**: Chrome extension with cross-retailer support
- **Comprehensive APIs**: RESTful endpoints with OpenAPI documentation

## 🛠 Development

### Start Development Servers

```bash
# Start both backend and frontend
./start-all.sh

# Or start individually
./start-backend.sh    # Backend API on http://localhost:8000
./start-frontend.sh   # Frontend app on http://localhost:5173
```

### Stop Development Servers

```bash
# Stop all services (from another terminal)
./stop-all.sh

# Or use Ctrl+C in the terminal running ./start-all.sh
# Individual services can be stopped with Ctrl+C in their terminals
```

### Access Points

- **Frontend Web App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔑 API Keys Required

ShopLyft requires two API keys for full functionality:

### OpenAI API Key

- **Purpose**: Powers AI-driven shopping list parsing and optimization
- **Get Key**: https://platform.openai.com/api-keys
- **Usage**: Natural language processing, product matching, route optimization

### Google Maps API Key

- **Purpose**: Route visualization and directions in the web app
- **Get Key**: https://developers.google.com/maps/documentation/embed/get-api-key
- **Usage**: Embedded maps, route display, store location services

> 💡 **Tip**: The setup script will prompt you to enter these keys interactively, or you can add them later to the `.env` files.

## 🏪 Supported Retailers

- **🟢 Woolworths**: Australia's largest supermarket chain
- **🔴 Coles**: Major competitor with extensive network
- **🟡 ALDI**: Discount retailer with growing presence

## 📋 Project Structure

```
ShopLyft/
├── 📁 backend/          # FastAPI server and AI services
├── 📁 frontend/         # React web application
├── 📁 extension/        # Chrome browser extension
├── 📁 data/            # Sample data and configurations
├── 🚀 setup.sh         # Automated setup script
├── ▶️ start-all.sh     # Start both servers
├── ⏹️ stop-all.sh      # Stop all services
├── ▶️ start-backend.sh # Start backend only
└── ▶️ start-frontend.sh # Start frontend only
```

## 🔧 Environment Configuration

After setup, configure your environment variables:

### Backend (.env)

```bash
OPENAI_API_KEY=your_openai_api_key_here
CONNECTONION_API_KEY=your_openai_api_key_here
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_MODE=dev
```

## 🚨 Troubleshooting

### Common Issues

**Setup Script Fails**

```bash
# Ensure you have required permissions
chmod +x setup.sh

# Check prerequisites
python3 --version  # Should be 3.8+
node --version      # Should be 16+
npm --version
```

**API Keys Not Working**

- Verify keys are correctly added to `.env` files
- Check API key permissions and quotas
- Restart servers after updating environment variables

**Extension Not Loading**

- Enable Chrome Developer Mode
- Load unpacked extension from `extension/` folder
- Check browser console for error messages

### Get Help

1. Check individual component README files for detailed troubleshooting
2. Review server logs for specific error messages
3. Verify all environment variables are properly configured
4. Ensure all prerequisites are installed and up to date

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for smarter grocery shopping in Australia** 🇦🇺
