# ShopLyft FastAPI Application
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
from typing import Dict, Any
import json
from pathlib import Path

# Import API routers
from api.routers import products, stores, pricing, optimization, plans
from api.models import HealthResponse, ErrorResponse

# Create FastAPI application
app = FastAPI(
    title="ShopLyft API",
    description="AI-powered grocery shopping optimization API for Australian supermarkets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(stores.router, prefix="/api/v1/stores", tags=["stores"])
app.include_router(pricing.router, prefix="/api/v1/pricing", tags=["pricing"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["optimization"])
app.include_router(plans.router, prefix="/api/v1/plans", tags=["plans"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc),
            status_code=500
        ).dict()
    )

# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint to verify API status."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to ShopLyft API",
        "description": "AI-powered grocery shopping optimization for Australian supermarkets",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# API info endpoint
@app.get("/api/v1/info", tags=["info"])
async def api_info():
    """Get API information and available endpoints."""
    return {
        "api_name": "ShopLyft API",
        "version": "1.0.0",
        "description": "AI-powered grocery shopping optimization API",
        "features": [
            "Product catalog management",
            "Store location services",
            "Price comparison and snapshots",
            "Shopping plan optimization",
            "Plan management and storage"
        ],
        "endpoints": {
            "products": "/api/v1/products",
            "stores": "/api/v1/stores",
            "pricing": "/api/v1/pricing",
            "optimization": "/api/v1/optimization",
            "plans": "/api/v1/plans"
        },
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
