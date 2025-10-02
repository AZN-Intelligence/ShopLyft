#!/usr/bin/env python3
"""
Setup script for Playwright browser automation.
Run this after installing requirements.txt to set up browser binaries.
"""

import subprocess
import sys

def install_playwright_browsers():
    """Install Playwright browser binaries."""
    try:
        print("Installing Playwright browser binaries...")
        result = subprocess.run([
            sys.executable, "-m", "playwright", "install", "firefox", "chromium"
        ], check=True, capture_output=True, text=True)
        
        print("✅ Playwright Firefox and Chromium browsers installed successfully!")
        print(result.stdout)
        
        # Also install system dependencies if needed
        print("Installing system dependencies...")
        result = subprocess.run([
            sys.executable, "-m", "playwright", "install-deps", "firefox", "chromium"
        ], check=True, capture_output=True, text=True)
        
        print("✅ System dependencies installed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing Playwright browsers: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Setting up Playwright for ShopLyft...")
    
    if install_playwright_browsers():
        print("\n✅ Playwright setup complete!")
        print("You can now use the browser-based Woolworths search functionality.")
    else:
        print("\n❌ Playwright setup failed!")
        print("The system will fall back to HTTP-based search methods.")
