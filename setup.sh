#!/bin/bash

# ShopLyft Project Setup Script
# This script sets up the complete ShopLyft development environment
# including backend API, frontend web app, and browser extension

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for better UX
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"

print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}${GEAR} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=()
    
    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python 3 found: $PYTHON_VERSION"
    else
        missing_deps+=("python3")
        print_error "Python 3 not found"
    fi
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        missing_deps+=("node")
        print_error "Node.js not found"
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        missing_deps+=("npm")
        print_error "npm not found"
    fi
    
    # Check git
    if command_exists git; then
        print_success "Git found"
    else
        missing_deps+=("git")
        print_error "Git not found"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo -e "\n${YELLOW}Please install the missing dependencies:${NC}"
        echo -e "• Python 3.8+: https://www.python.org/downloads/"
        echo -e "• Node.js 16+: https://nodejs.org/"
        echo -e "• Git: https://git-scm.com/"
        exit 1
    fi
    
    print_success "All prerequisites satisfied!"
}

# Setup backend
setup_backend() {
    print_header "Setting Up Backend (FastAPI)"
    
    cd backend
    
    print_step "Creating Python virtual environment..."
    python3 -m venv .venv
    
    print_step "Activating virtual environment..."
    source .venv/bin/activate
    
    print_step "Upgrading pip..."
    pip install --upgrade pip
    
    print_step "Installing Python dependencies..."
    pip install -r requirements.txt
    
    print_success "Backend setup complete!"
    
    # Return to project root
    cd ..
}

# Setup frontend
setup_frontend() {
    print_header "Setting Up Frontend (React + Vite)"
    
    cd frontend
    
    print_step "Installing Node.js dependencies..."
    npm install
    
    print_step "Checking for environment variables..."
    if [ ! -f .env ]; then
        print_warning "Creating .env file with default values..."
        cat > .env << EOF
# ShopLyft Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_MODE=dev
EOF
        print_info "Please update .env file with your Google Maps API key"
    else
        print_success ".env file already exists"
    fi
    
    print_success "Frontend setup complete!"
    
    # Return to project root
    cd ..
}

# Setup extension
setup_extension() {
    print_header "Setting Up Browser Extension"
    
    print_info "Browser extension is ready to use!"
    print_info "To install in Chrome:"
    echo -e "  1. Open Chrome and go to ${CYAN}chrome://extensions/${NC}"
    echo -e "  2. Enable ${YELLOW}'Developer mode'${NC}"
    echo -e "  3. Click ${YELLOW}'Load unpacked'${NC} and select the ${CYAN}extension/${NC} folder"
    
    print_success "Extension setup instructions provided!"
}

# Create startup scripts
create_startup_scripts() {
    print_header "Creating Startup Scripts"
    
    # Backend startup script
    print_step "Creating backend startup script..."
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ShopLyft Backend..."
cd backend
source .venv/bin/activate
python start_api.py
EOF
    chmod +x start-backend.sh
    
    # Frontend startup script
    print_step "Creating frontend startup script..."
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ShopLyft Frontend..."
cd frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Combined startup script
    print_step "Creating combined startup script..."
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting ShopLyft Full Stack..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "📡 Starting backend server..."
cd backend
source .venv/bin/activate
python start_api.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ ShopLyft is now running!"
echo "📡 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF
    chmod +x start-all.sh
    
    print_success "Startup scripts created!"
}

# Test installations
test_installations() {
    print_header "Testing Installations"
    
    # Test backend
    print_step "Testing backend setup..."
    cd backend
    if source .venv/bin/activate && python -c "import fastapi, uvicorn, pydantic; print('Backend dependencies OK')"; then
        print_success "Backend dependencies verified"
    else
        print_error "Backend dependency test failed"
        return 1
    fi
    cd ..
    
    # Test frontend
    print_step "Testing frontend setup..."
    cd frontend
    if npm list --depth=0 >/dev/null 2>&1; then
        print_success "Frontend dependencies verified"
    else
        print_error "Frontend dependency test failed"
        return 1
    fi
    cd ..
    
    print_success "All installations tested successfully!"
}

# Main setup function
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ShopLyft Setup Script                     ║"
    echo "║          AI-Powered Grocery Shopping Optimization            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_info "This script will set up the complete ShopLyft development environment"
    print_info "Components: Backend API, Frontend Web App, Browser Extension"
    
    # Confirm before proceeding
    echo -e "\n${YELLOW}Do you want to continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled by user"
        exit 0
    fi
    
    # Check if we're in the right directory
    if [ ! -f "setup.sh" ] || [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "extension" ]; then
        print_error "Please run this script from the ShopLyft project root directory"
        exit 1
    fi
    
    # Run setup steps
    check_prerequisites
    setup_backend
    setup_frontend
    setup_extension
    create_startup_scripts
    test_installations
    
    # Final success message
    print_header "Setup Complete! ${ROCKET}"
    
    echo -e "${GREEN}🎉 ShopLyft development environment is ready!${NC}\n"
    
    echo -e "${CYAN}Quick Start Commands:${NC}"
    echo -e "• ${YELLOW}./start-all.sh${NC}      - Start both backend and frontend"
    echo -e "• ${YELLOW}./start-backend.sh${NC}  - Start only backend API"
    echo -e "• ${YELLOW}./start-frontend.sh${NC} - Start only frontend web app"
    
    echo -e "\n${CYAN}Access Points:${NC}"
    echo -e "• Frontend Web App: ${BLUE}http://localhost:5173${NC}"
    echo -e "• Backend API: ${BLUE}http://localhost:8000${NC}"
    echo -e "• API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
    
    echo -e "\n${CYAN}Next Steps:${NC}"
    echo -e "1. Update ${YELLOW}frontend/.env${NC} with your Google Maps API key"
    echo -e "2. Install the browser extension in Chrome (see instructions above)"
    echo -e "3. Run ${YELLOW}./start-all.sh${NC} to start the development servers"
    
    echo -e "\n${GREEN}Happy coding! 🚀${NC}"
}

# Run main function
main "$@"
