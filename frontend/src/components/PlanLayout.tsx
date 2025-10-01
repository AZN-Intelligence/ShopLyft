import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { type PlanData, TEMPLATE_PLAN } from "./planTemplate";
import SupermarketIcon from "./SupermarketIcon";
import AddToCartButton from "./AddToCartButton";

interface PlanLayoutProps {
  planData?: PlanData;
  isLoading?: boolean;
}

function PlanLayout({
  planData = TEMPLATE_PLAN,
  isLoading = false,
}: PlanLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure scroll starts at the beginning when component mounts
  useEffect(() => {
    if (scrollContainerRef.current && !isLoading) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[70%] max-w-7xl flex flex-col px-8 py-4"
      >
        {/* Header */}
        <div className="text-center mb-6 max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">
            Your Shopping Route
          </h2>
          <p className="text-orange-700 text-base">
            Optimized for savings and efficiency
          </p>
        </div>

        {/* Savings and Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6 max-w-4xl mx-auto w-full">
          {/* Savings Highlight */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-xl p-3 text-center"
          >
            <div className="text-3xl font-bold text-green-600 mb-1">
              {isLoading ? "..." : `$${planData.total_savings.toFixed(2)}`}
            </div>
            <div className="text-green-700 font-medium text-base">
              Total Savings
            </div>
          </motion.div>

          {/* Time Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {isLoading ? "..." : `${planData.total_time} min`}
              </div>
              <div className="text-orange-700 font-medium text-base">
                Total Time
              </div>
            </div>
          </motion.div>

          {/* Cost Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-3"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {isLoading ? "..." : `$${planData.total_cost.toFixed(2)}`}
              </div>
              <div className="text-blue-700 font-medium text-base">
                Total Cost
              </div>
            </div>
          </motion.div>
        </div>

        {/* Route Visualization */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            // Loading skeleton
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse flex space-x-8 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="bg-orange-200 rounded-lg p-4 w-80 h-56"></div>
                    {i < 3 && (
                      <div className="w-12 h-12 bg-orange-200 rounded-full ml-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Route with stores and arrows
            <div
              ref={scrollContainerRef}
              className="flex items-center justify-center h-full overflow-x-auto scroll-smooth"
            >
              <div className="flex items-center space-x-4 max-w-5xl mx-auto px-6">
                {/* Starting Point */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border-2 border-orange-200 rounded-lg p-4 text-center w-56 h-44 flex flex-col justify-center shadow-lg"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🏠</span>
                  </div>
                  <h3 className="font-semibold text-orange-800 text-sm mb-2">
                    Starting Point
                  </h3>
                  <p className="text-xs text-orange-600">
                    {planData.starting_location.address}
                  </p>
                </motion.div>

                {/* Route Segments and Stores */}
                {planData.stores.map((store, index) => {
                  const routeSegment = planData.route_segments[index];
                  return (
                    <div
                      key={store.store_info.store_id}
                      className="flex items-center"
                    >
                      {/* Arrow and Route Info */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex flex-col items-center mx-3"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center mt-3 bg-white rounded-lg p-3 shadow-sm border border-orange-100 w-24 h-20 flex flex-col justify-center">
                          <div className="text-sm font-semibold text-orange-600 mb-1">
                            {routeSegment.distance_km}km
                          </div>
                          <div className="text-sm text-orange-500 mb-1">
                            {routeSegment.travel_time_min}min
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {routeSegment.travel_method}
                          </div>
                        </div>
                      </motion.div>

                      {/* Store Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white border border-orange-200 rounded-lg p-4 w-72 shadow-lg h-52 flex flex-col"
                      >
                        {/* Store Header with Icon */}
                        <div className="flex items-center mb-3 h-10">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <SupermarketIcon
                              retailerId={store.store_info.retailer_id}
                              size="sm"
                            />
                            <h3 className="text-sm font-semibold text-orange-800 truncate">
                              {store.store_info.name}
                            </h3>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-1 text-xs text-orange-700 mb-3 flex-1 overflow-y-auto">
                          {store.items.slice(0, 2).map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex justify-between items-center py-0.5"
                            >
                              <span className="truncate flex-1">
                                • {item.product_name} ({item.quantity}x)
                              </span>
                              <span className="font-medium ml-2 text-xs">
                                ${item.line_total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {store.items.length > 2 && (
                            <div className="text-xs text-orange-600 font-medium">
                              +{store.items.length - 2} more items
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-2 border-t border-orange-100 mt-auto">
                          {/* Add to Cart Button */}
                          <AddToCartButton size="sm" />
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              store.click_collect_available &&
                              store.min_spend_met
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {store.click_collect_available &&
                            store.min_spend_met
                              ? "C&C"
                              : "In-store"}
                          </span>

                          {/* Total - Right aligned */}
                          <span className="text-sm font-bold text-orange-800">
                            ${store.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default PlanLayout;
