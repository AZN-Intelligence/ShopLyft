#!/usr/bin/env python3
"""
Comprehensive test for ShopLyft AI Agent using ConnectOnion
Tests various location inputs and shopping scenarios
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'meta-agent'))

from agent import agent, parse_location

def test_location_parsing():
    """Test the location parsing function with various inputs."""
    print("🗺️ Testing Location Parsing...")
    print("=" * 50)
    
    test_cases = [
        "Sydney CBD",
        "Bondi Junction", 
        "Pyrmont",
        "Newtown",
        "bondi",  # partial match
        "central",  # partial match
        "-33.871, 151.206",  # coordinates
        "invalid location"  # fallback test
    ]
    
    for location_input in test_cases:
        result = parse_location(location_input)
        print(f"'{location_input}' -> {result}")
    
    print("\n✅ Location parsing tests completed!\n")

def test_shopping_scenarios():
    """Test various shopping scenarios with different locations."""
    
    test_scenarios = [
        {
            "name": "Basic Sydney CBD",
            "input": "Shopping list: milk, bread, eggs\nLocation: Sydney CBD"
        },
        {
            "name": "Bondi Junction",
            "input": "Shopping list: pasta, tomato sauce, cheese\nLocation: Bondi Junction"
        },
        {
            "name": "Pyrmont with coordinates",
            "input": "Shopping list: apples, bananas, yogurt\nLocation: -33.869, 151.195"
        },
        {
            "name": "Newtown partial location",
            "input": "Shopping list: chicken breast, rice, onions\nLocation: newtown"
        },
        {
            "name": "Complex shopping list",
            "input": "Shopping list: milk 2L, wholemeal bread, 18 eggs, bananas, pasta, tomato sauce, chicken breast, cheddar cheese, olive oil\nLocation: Darlinghurst"
        }
    ]
    
    print("🛒 Testing Shopping Scenarios...")
    print("=" * 60)
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n📋 Test {i}: {scenario['name']}")
        print("-" * 40)
        print(f"Input: {scenario['input']}")
        print("\nProcessing...")
        
        try:
            response = agent.input(scenario['input'])
            print(f"\n✅ Response received (length: {len(response)} chars)")
            
            # Check if response contains expected elements
            if "Plan_v1" in response or "plan" in response.lower():
                print("✅ Contains plan structure")
            if "woolworths" in response.lower() or "coles" in response.lower() or "aldi" in response.lower():
                print("✅ Contains retailer information")
            if "$" in response or "total" in response.lower():
                print("✅ Contains pricing information")
                
        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
        
        print("\n" + "="*60)

def test_basic_functionality():
    """Test basic agent functionality with ConnectOnion."""
    
    print("🧪 ShopLyft AI Agent - Comprehensive Testing")
    print("=" * 60)
    print("Testing location parsing and shopping optimization...")
    
    # Test location parsing first
    test_location_parsing()
    
    # Test shopping scenarios
    test_shopping_scenarios()
    
    print("\n🎉 All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_basic_functionality()
