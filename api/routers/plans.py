# Plans API Router
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timezone
from pathlib import Path

from api.models import (
    PlanEntry, PlanResponse, PlanSaveRequest, PlanSaveResponse,
    ShoppingPlan, ErrorResponse
)

router = APIRouter()

def load_json_data(filename: str) -> dict:
    """Load JSON data from the data directory."""
    data_path = Path(__file__).parent.parent.parent / "data" / filename
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_json_data(filename: str, data: dict) -> None:
    """Save JSON data to the data directory."""
    data_path = Path(__file__).parent.parent.parent / "data" / filename
    with open(data_path, 'w') as f:
        json.dump(data, f, indent=2)

@router.get("/", response_model=PlanResponse, summary="Get all saved plans")
async def get_all_plans():
    """Get all saved shopping plans."""
    try:
        plans_data = load_json_data("plans.json")
        plans = []
        
        for plan_entry in plans_data.get("plans", []):
            # Handle legacy format where payload might be a JSON string
            payload = plan_entry["payload"]
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep as string
                    pass
            
            plans.append(PlanEntry(
                plan_id=plan_entry["plan_id"],
                generated_at=datetime.fromisoformat(plan_entry["generated_at"].replace('Z', '+00:00')),
                payload=payload
            ))
        
        # Sort by generation time (newest first)
        plans.sort(key=lambda x: x.generated_at, reverse=True)
        
        return PlanResponse(plans=plans)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load plans: {str(e)}"
        )

@router.get("/{plan_id}", response_model=PlanEntry, summary="Get plan by ID")
async def get_plan_by_id(plan_id: str):
    """Get a specific shopping plan by its ID."""
    try:
        plans_data = load_json_data("plans.json")
        
        for plan_entry in plans_data.get("plans", []):
            if plan_entry.get("plan_id") == plan_id:
                # Handle legacy format where payload might be a JSON string
                payload = plan_entry["payload"]
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except json.JSONDecodeError:
                        # If it's not valid JSON, keep as string
                        pass
                
                return PlanEntry(
                    plan_id=plan_entry["plan_id"],
                    generated_at=datetime.fromisoformat(plan_entry["generated_at"].replace('Z', '+00:00')),
                    payload=payload
                )
        
        raise HTTPException(
            status_code=404,
            detail=f"Plan with ID '{plan_id}' not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load plan: {str(e)}"
        )

@router.post("/save", response_model=PlanSaveResponse, summary="Save a shopping plan")
async def save_plan(request: PlanSaveRequest):
    """Save a shopping plan to the database."""
    try:
        plans_data = load_json_data("plans.json")
        
        # Generate plan ID
        plan_id = f"plan_{len(plans_data.get('plans', [])) + 1:06d}"
        
        # Convert ShoppingPlan to dict for storage
        plan_dict = request.plan_data.dict()
        
        plan_entry = {
            "plan_id": plan_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "payload": plan_dict
        }
        
        if "plans" not in plans_data:
            plans_data["plans"] = []
        
        plans_data["plans"].append(plan_entry)
        
        # Save to file
        save_json_data("plans.json", plans_data)
        
        return PlanSaveResponse(
            plan_id=plan_id,
            message=f"Plan saved successfully with ID: {plan_id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save plan: {str(e)}"
        )

@router.delete("/{plan_id}", summary="Delete a shopping plan")
async def delete_plan(plan_id: str):
    """Delete a specific shopping plan."""
    try:
        plans_data = load_json_data("plans.json")
        
        # Find and remove the plan
        original_count = len(plans_data.get("plans", []))
        plans_data["plans"] = [
            plan for plan in plans_data.get("plans", [])
            if plan.get("plan_id") != plan_id
        ]
        
        if len(plans_data["plans"]) == original_count:
            raise HTTPException(
                status_code=404,
                detail=f"Plan with ID '{plan_id}' not found"
            )
        
        # Save updated data
        save_json_data("plans.json", plans_data)
        
        return {"message": f"Plan '{plan_id}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete plan: {str(e)}"
        )

@router.get("/search/recent", response_model=PlanResponse, summary="Get recent plans")
async def get_recent_plans(
    limit: int = Query(10, description="Number of recent plans to return", ge=1, le=100)
):
    """Get the most recently generated plans."""
    try:
        plans_data = load_json_data("plans.json")
        plans = []
        
        for plan_entry in plans_data.get("plans", []):
            # Handle legacy format where payload might be a JSON string
            payload = plan_entry["payload"]
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    # If it's not valid JSON, keep as string
                    pass
            
            plans.append(PlanEntry(
                plan_id=plan_entry["plan_id"],
                generated_at=datetime.fromisoformat(plan_entry["generated_at"].replace('Z', '+00:00')),
                payload=payload
            ))
        
        # Sort by generation time (newest first) and limit
        plans.sort(key=lambda x: x.generated_at, reverse=True)
        plans = plans[:limit]
        
        return PlanResponse(plans=plans)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load recent plans: {str(e)}"
        )

@router.get("/stats/summary", summary="Get plans statistics")
async def get_plans_stats():
    """Get statistics about saved plans."""
    try:
        plans_data = load_json_data("plans.json")
        plans = plans_data.get("plans", [])
        
        if not plans:
            return {
                "total_plans": 0,
                "oldest_plan": None,
                "newest_plan": None,
                "average_cost": 0.0,
                "average_stores": 0.0,
                "average_time": 0.0
            }
        
        # Calculate statistics
        total_plans = len(plans)
        
        # Find oldest and newest plans
        timestamps = [datetime.fromisoformat(plan["generated_at"].replace('Z', '+00:00')) for plan in plans]
        oldest_plan = min(timestamps)
        newest_plan = max(timestamps)
        
        # Calculate averages from plan payloads
        total_cost = 0.0
        total_stores = 0
        total_time = 0.0
        valid_plans = 0
        
        for plan in plans:
            payload = plan.get("payload", {})
            
            # Handle legacy format where payload might be a JSON string
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    payload = {}
            
            if payload:
                # Try different field names for legacy compatibility
                cost = payload.get("total_cost") or payload.get("grand_total") or payload.get("grand_subtotal", 0.0)
                stores = payload.get("num_stores") or len(payload.get("stores", []))
                time = payload.get("total_time") or payload.get("total_travel_time", 0.0)
                
                total_cost += cost
                total_stores += stores
                total_time += time
                valid_plans += 1
        
        average_cost = total_cost / valid_plans if valid_plans > 0 else 0.0
        average_stores = total_stores / valid_plans if valid_plans > 0 else 0.0
        average_time = total_time / valid_plans if valid_plans > 0 else 0.0
        
        return {
            "total_plans": total_plans,
            "oldest_plan": oldest_plan.isoformat(),
            "newest_plan": newest_plan.isoformat(),
            "average_cost": round(average_cost, 2),
            "average_stores": round(average_stores, 2),
            "average_time": round(average_time, 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get plans statistics: {str(e)}"
        )

@router.get("/export/{plan_id}", summary="Export plan as JSON")
async def export_plan(plan_id: str):
    """Export a specific plan as JSON."""
    try:
        plans_data = load_json_data("plans.json")
        
        for plan_entry in plans_data.get("plans", []):
            if plan_entry.get("plan_id") == plan_id:
                payload = plan_entry["payload"]
                
                # Handle legacy format where payload might be a JSON string
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except json.JSONDecodeError:
                        # If it's not valid JSON, keep as string
                        pass
                
                return {
                    "plan_id": plan_id,
                    "exported_at": datetime.now(timezone.utc).isoformat(),
                    "plan_data": payload
                }
        
        raise HTTPException(
            status_code=404,
            detail=f"Plan with ID '{plan_id}' not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export plan: {str(e)}"
        )

@router.post("/import", response_model=PlanSaveResponse, summary="Import a plan from JSON")
async def import_plan(plan_data: Dict[str, Any]):
    """Import a shopping plan from JSON data."""
    try:
        # Validate the plan data structure
        required_fields = ["total_cost", "total_time", "num_stores", "store_baskets"]
        for field in required_fields:
            if field not in plan_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )
        
        # Create a ShoppingPlan object to validate the data
        try:
            shopping_plan = ShoppingPlan(**plan_data)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid plan data structure: {str(e)}"
            )
        
        # Save the plan
        save_request = PlanSaveRequest(plan_data=shopping_plan)
        return await save_plan(save_request)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to import plan: {str(e)}"
        )

@router.get("/search/by-cost", response_model=PlanResponse, summary="Search plans by cost range")
async def search_plans_by_cost(
    min_cost: Optional[float] = Query(None, description="Minimum cost filter"),
    max_cost: Optional[float] = Query(None, description="Maximum cost filter")
):
    """Search plans by cost range."""
    try:
        plans_data = load_json_data("plans.json")
        matching_plans = []
        
        for plan_entry in plans_data.get("plans", []):
            payload = plan_entry.get("payload", {})
            
            # Handle legacy format where payload might be a JSON string
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    payload = {}
            
            # Try different field names for legacy compatibility
            cost = payload.get("total_cost") or payload.get("grand_total") or payload.get("grand_subtotal", 0.0)
            
            # Apply cost filters
            if min_cost is not None and cost < min_cost:
                continue
            if max_cost is not None and cost > max_cost:
                continue
            
            matching_plans.append(PlanEntry(
                plan_id=plan_entry["plan_id"],
                generated_at=datetime.fromisoformat(plan_entry["generated_at"].replace('Z', '+00:00')),
                payload=payload
            ))
        
        # Sort by cost (ascending)
        matching_plans.sort(key=lambda x: x.payload.get("total_cost", 0.0))
        
        return PlanResponse(plans=matching_plans)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search plans by cost: {str(e)}"
        )

@router.get("/search/by-stores", response_model=PlanResponse, summary="Search plans by number of stores")
async def search_plans_by_stores(
    min_stores: Optional[int] = Query(None, description="Minimum number of stores"),
    max_stores: Optional[int] = Query(None, description="Maximum number of stores")
):
    """Search plans by number of stores."""
    try:
        plans_data = load_json_data("plans.json")
        matching_plans = []
        
        for plan_entry in plans_data.get("plans", []):
            payload = plan_entry.get("payload", {})
            
            # Handle legacy format where payload might be a JSON string
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    payload = {}
            
            # Try different field names for legacy compatibility
            num_stores = payload.get("num_stores") or len(payload.get("stores", []))
            
            # Apply store count filters
            if min_stores is not None and num_stores < min_stores:
                continue
            if max_stores is not None and num_stores > max_stores:
                continue
            
            matching_plans.append(PlanEntry(
                plan_id=plan_entry["plan_id"],
                generated_at=datetime.fromisoformat(plan_entry["generated_at"].replace('Z', '+00:00')),
                payload=payload
            ))
        
        # Sort by number of stores (ascending)
        matching_plans.sort(key=lambda x: x.payload.get("num_stores", 0))
        
        return PlanResponse(plans=matching_plans)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search plans by stores: {str(e)}"
        )

@router.post("/migrate", summary="Migrate legacy plans to new format")
async def migrate_legacy_plans():
    """Migrate legacy plans from string format to proper JSON objects."""
    try:
        plans_data = load_json_data("plans.json")
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
                except json.JSONDecodeError:
                    # Skip invalid JSON strings
                    continue
        
        # Save the migrated data back to file
        if migrated_count > 0:
            save_json_data("plans.json", plans_data)
        
        return {
            "message": f"Successfully migrated {migrated_count} legacy plans to new format",
            "migrated_count": migrated_count,
            "total_plans": len(plans_data.get("plans", []))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to migrate legacy plans: {str(e)}"
        )
