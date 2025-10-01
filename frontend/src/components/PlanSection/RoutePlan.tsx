import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { type PlanData } from "./planTemplate";
import SupermarketIcon from "./SupermarketIcon";
import AddToCartButton from "./AddToCartButton";

interface RoutePlanProps {
  planData: PlanData;
  isLoading: boolean;
}

function RoutePlan({ planData, isLoading }: RoutePlanProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure scroll starts at the beginning when component mounts
  useEffect(() => {
    if (scrollContainerRef.current && !isLoading) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold text-orange-600 mb-4 flex-shrink-0">
        Route Plan
      </h3>
      {isLoading ? (
        // Loading skeleton
        <div className="space-y-4 overflow-y-auto flex-1 pb-4 min-h-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-orange-200 rounded-lg p-4 h-32"
            ></div>
          ))}
        </div>
      ) : (
        // Vertical route with stores
        <div className="space-y-4 overflow-y-auto flex-1 pb-4 min-h-0 max-h-[calc(100vh-12rem)]">
          {/* Starting Point */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-orange-200 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">🏠</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 text-base mb-1">
                  Starting Point
                </h3>
                <p className="text-sm text-orange-600">
                  {planData.starting_location.address}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Route Segments and Stores */}
          {planData.stores.map((store, index) => {
            const routeSegment = planData.route_segments[index];
            return (
              <div key={store.store_info.store_id} className="space-y-4">
                {/* Route Segment */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-center"
                >
                  <div className="flex items-center space-x-4 bg-white rounded-lg p-3 shadow-sm border border-orange-100">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white rotate-180"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.707l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 9.414V13a1 1 0 11-2 0V9.414l-1.293 1.293a1 1 0 01-1.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-orange-600">
                        {routeSegment.distance_km}km •{" "}
                        {routeSegment.travel_time_min}min
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {routeSegment.travel_method}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Store Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white border border-orange-200 rounded-lg p-4 shadow-lg"
                >
                  {/* Store Header with Icon */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <SupermarketIcon
                        retailerId={store.store_info.retailer_id}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-orange-800 truncate">
                          {store.store_info.name}
                        </h3>
                        <p className="text-xs text-orange-600 truncate">
                          {store.store_info.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 text-sm text-orange-700 mb-4">
                    {store.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="truncate flex-1">
                          • {item.product_name} ({item.quantity}x)
                        </span>
                        <span className="font-medium ml-2">
                          ${item.line_total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-orange-100">
                    {/* Add to Cart Button with store-specific links */}
                    <AddToCartButton size="sm" links={store.links || []} />
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        store.click_collect_available && store.min_spend_met
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {store.click_collect_available && store.min_spend_met
                        ? "Click & Collect"
                        : "In-store Only"}
                    </span>

                    {/* Total - Right aligned */}
                    <span className="text-lg font-bold text-orange-800">
                      ${store.subtotal.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoutePlan;
