#!/usr/bin/env python3
"""
Simple test for ShopLyft AI Agent using ConnectOnion
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'meta-agent'))

from agent import agent

def test_basic_functionality():
    """Test basic agent functionality with ConnectOnion."""
    
    print("🧪 Testing ShopLyft AI Agent with ConnectOnion...")
    print("=" * 60)
    
    # Test input
    test_input = """
    Shopping list: milk, bread, eggs
    Location: -33.871, 151.206 (Sydney CBD)
    """
    
    print(f"Input: {test_input.strip()}")
    print("\nProcessing with ConnectOnion...")
    print("-" * 60)
    
    try:
        response = agent.input(test_input)
        print(f"\nAgent Response:\n{response}")
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_basic_functionality()
