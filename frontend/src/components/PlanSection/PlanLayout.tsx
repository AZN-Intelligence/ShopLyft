import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { type PlanData, TEMPLATE_PLAN } from "./planTemplate";
import PlanHeader from "./PlanHeader";
import RoutePlan from "./RoutePlan";
import RouteMap from "./RouteMap";
import MobileToggle from "./MobileToggle";
import JumpingCharacter from "./JumpingCharacter";

// Server response format interfaces
interface ServerStoreBasket {
  store_info: {
    store_id: string;
    name: string;
    address: string;
    retailer_id: string;
    suburb?: string;
    postcode?: string;
    location?: { lat: number; lng: number };
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    item_requested: string;
  }>;
  subtotal: number;
  click_collect_eligible: boolean;
  min_spend_required: number;
  links?: string[];
}

interface ServerPlanData {
  plan_id?: string;
  total_cost: number;
  total_time: number;
  travel_time: number;
  shopping_time: number;
  total_savings: number;
  route_score: number;
  starting_location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  stores?: ServerStoreBasket[];
  route_segments?: Array<{
    from_store_id?: string;
    to_store_id: string;
    distance_km: number;
    travel_time_min: number;
    travel_method: string;
  }>;
  optimization_details?: {
    price_component: number;
    time_component: number;
    total_items: number;
    stores_count: number;
  };
  num_stores: number;
  store_baskets: ServerStoreBasket[];
  generated_at?: string;
}

interface PlanLayoutProps {
  planData: PlanData | null;
  isLoading?: boolean;
}

function PlanLayout({ planData, isLoading = false }: PlanLayoutProps) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showJumpingCharacter, setShowJumpingCharacter] = useState(false);

  // Determine which plan data to use based on environment and server availability
  // Memoized to prevent repeated conversion on every render
  const actualPlanData = useMemo((): PlanData | null => {
    const isProduction = import.meta.env.VITE_MODE === "prod";

    if (planData) {
      // Check if this is server response format (has store_baskets) vs template format (has stores)
      if ("store_baskets" in planData) {
        // Convert server response format to template format
        console.log("Converting server response to template format");
        const serverData = planData as unknown as ServerPlanData;

        // Convert store_baskets to stores format
        const convertedStores = serverData.store_baskets.map((basket) => ({
          store_info: basket.store_info,
          items: basket.items,
          subtotal: basket.subtotal,
          click_collect_available: basket.click_collect_eligible,
          min_spend_met: basket.min_spend_required === 0,
          links: basket.links || [], // Use server links if available, otherwise empty array
        }));

        // Use server route segments if available, otherwise generate basic ones
        const routeSegments =
          serverData.route_segments ||
          convertedStores.map((store, index) => ({
            from_store_id:
              index > 0
                ? convertedStores[index - 1].store_info.store_id
                : undefined,
            to_store_id: store.store_info.store_id,
            distance_km: 0.5 + Math.random() * 1, // Placeholder distances
            travel_time_min: Math.ceil((0.5 + Math.random() * 1) * 8), // ~8 min per km walking
            travel_method: "walking" as const,
          }));

        return {
          total_cost: serverData.total_cost,
          total_time: serverData.total_time,
          travel_time: serverData.travel_time,
          shopping_time: serverData.shopping_time,
          total_savings: serverData.total_savings,
          route_score: serverData.route_score,
          starting_location: serverData.starting_location || {
            address: "Current Location",
            coordinates: { lat: 0, lng: 0 },
          },
          stores: convertedStores,
          route_segments: routeSegments,
          optimization_details: serverData.optimization_details || {
            price_component: 0.8,
            time_component: 0.2,
            total_items: convertedStores.reduce(
              (sum, store) => sum + store.items.length,
              0
            ),
            stores_count: convertedStores.length,
          },
        } as PlanData;
      } else {
        // Already in template format
        return planData;
      }
    } else if (!isProduction) {
      // Fall back to template data in development mode when server is down
      console.log("Server down - using template data (development mode)");
      return TEMPLATE_PLAN;
    } else {
      // Production mode with no server data - return null
      console.log("No plan data available (production mode)");
      return null;
    }
  }, [planData]); // Only recalculate when planData changes

  // Trigger character animation when component mounts (plan is loaded)
  useEffect(() => {
    if (!isLoading && actualPlanData) {
      const timer = setTimeout(() => {
        setShowJumpingCharacter(true);

        // Hide character after 4.5 seconds (to match animation duration)
        const hideTimer = setTimeout(() => {
          setShowJumpingCharacter(false);
        }, 4500);

        return () => clearTimeout(hideTimer);
      }, 500); // Small delay after plan loads

      return () => clearTimeout(timer);
    }
  }, [isLoading, actualPlanData]);

  // Show loading or error state if no plan data available
  if (!actualPlanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-4">
            {isLoading ? "Loading your plan..." : "No plan data available"}
          </div>
          {!isLoading && (
            <div className="text-gray-600">
              Please generate a shopping plan first.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl flex flex-col p-4 md:p-8 lg:p-16"
      >
        {/* Desktop Layout (lg and above) */}
        <div className="hidden xl:grid h-[calc(100vh-12rem)] grid-cols-2 gap-6">
          {/* Left Column - Route Plan */}
          <div className="flex flex-col h-full">
            <RoutePlan planData={actualPlanData} isLoading={isLoading} />
          </div>

          {/* Right Column - Header + Map */}
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-2">
              <PlanHeader planData={actualPlanData} isLoading={isLoading} />
            </div>
            <div className="flex-1 min-h-0">
              <RouteMap
                planData={actualPlanData}
                isExpanded={isMapExpanded}
                onExpand={() => setIsMapExpanded(!isMapExpanded)}
              />
            </div>
          </div>
        </div>

        {/* Tablet Layout (md to lg) */}
        <div className="hidden md:grid xl:hidden h-[calc(100vh-12rem)] grid-cols-2 grid-rows-2 gap-6">
          {/* First Row - Route Plan */}
          <div className="flex flex-col h-full">
            <RoutePlan planData={actualPlanData} isLoading={isLoading} />
          </div>

          {/* First Row - Receipt Summary */}
          <div className="flex flex-col h-full">
            <PlanHeader planData={actualPlanData} isLoading={isLoading} />
          </div>

          {/* Second Row - Google Map (spans full width) */}
          <div className="col-span-2 flex flex-col h-full">
            <RouteMap
              planData={actualPlanData}
              isExpanded={isMapExpanded}
              onExpand={() => setIsMapExpanded(!isMapExpanded)}
            />
          </div>
        </div>

        {/* Mobile Layout (below md) */}
        <div className="md:hidden space-y-6">
          {/* First Row - Header */}
          <PlanHeader planData={actualPlanData} isLoading={isLoading} />

          {/* Second Row - Toggle between Route Plan and Map */}
          <MobileToggle
            planData={actualPlanData}
            isLoading={isLoading}
            isMapExpanded={isMapExpanded}
            onMapExpand={() => setIsMapExpanded(!isMapExpanded)}
          />
        </div>

        {/* Jumping Character - appears on all layouts */}
        <JumpingCharacter
          isVisible={showJumpingCharacter}
          onAnimationComplete={() => setShowJumpingCharacter(false)}
        />
      </motion.div>
    </div>
  );
}

export default PlanLayout;
