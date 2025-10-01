#!/usr/bin/env python3
"""
Manual migration script for ShopLyft plans
This script migrates legacy plans from string format to proper JSON objects.
"""

import json
from pathlib import Path

def migrate_plans():
    """Migrate legacy plans from string format to proper JSON objects."""
    data_path = Path(__file__).parent / "data" / "plans.json"
    
    if not data_path.exists():
        print("❌ plans.json file not found")
        return
    
    print("🔄 Migrating legacy plans...")
    
    try:
        # Load the plans data
        with open(data_path, 'r') as f:
            plans_data = json.load(f)
        
        migrated_count = 0
        
        for plan_entry in plans_data.get("plans", []):
            payload = plan_entry.get("payload", {})
            
            # Check if payload is a JSON string that needs migration
            if isinstance(payload, str):
                try:
                    # Parse the JSON string
                    parsed_payload = json.loads(payload)
                    # Update the payload to be a proper JSON object
                    plan_entry["payload"] = parsed_payload
                    migrated_count += 1
                    print(f"   ✅ Migrated plan: {plan_entry['plan_id']}")
                except json.JSONDecodeError as e:
                    print(f"   ❌ Failed to parse plan {plan_entry['plan_id']}: {e}")
                    continue
        
        # Save the migrated data back to file
        if migrated_count > 0:
            with open(data_path, 'w') as f:
                json.dump(plans_data, f, indent=2)
            print(f"\n🎉 Successfully migrated {migrated_count} plans!")
        else:
            print("\n✅ No plans needed migration (all plans are already in correct format)")
        
        print(f"📊 Total plans: {len(plans_data.get('plans', []))}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_plans()
