#!/usr/bin/env python3
"""
ShopLyft FastAPI Server Startup Script

This script starts the ShopLyft FastAPI server with proper configuration.
Make sure to install dependencies first: pip install -r requirements.txt
"""

import uvicorn
import sys
from pathlib import Path

def main():
    """Start the FastAPI server."""
    try:
        # Check if we're in the right directory
        if not Path("main.py").exists():
            print("Error: main.py not found. Please run this script from the ShopLyft root directory.")
            sys.exit(1)
        
        print("🛒 Starting ShopLyft FastAPI Server...")
        print("📚 API Documentation available at: http://localhost:8000/docs")
        print("🔍 Health check available at: http://localhost:8000/health")
        print("🌐 Server will be available at: http://localhost:8000")
        print("\nPress Ctrl+C to stop the server.\n")
        
        # Start the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user.")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\nMake sure you have installed the dependencies:")
        print("pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main()
