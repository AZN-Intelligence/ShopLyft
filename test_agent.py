#!/usr/bin/env python3
"""
Simple test script for ShopLyft AI Agent
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'meta-agent'))

from agent import agent

def test_agent():
    """Test the ShopLyft agent with a simple shopping list."""
    
    print("🧪 Testing ShopLyft AI Agent...")
    print("=" * 50)
    
    # Test input
    test_input = """
    Shopping list: milk, bread, eggs
    Location: -33.871, 151.206 (Sydney CBD)
    Preferences: substitutions ok, max_stores 3, weight time 0.2 cost 0.8
    """
    
    print(f"Input: {test_input.strip()}")
    print("\nProcessing...")
    print("-" * 50)
    
    try:
        response = agent.input(test_input)
        print(f"\nAgent Response:\n{response}")
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_agent()
