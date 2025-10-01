import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { type PlanData, TEMPLATE_PLAN } from "./planTemplate";
import SupermarketIcon from "./SupermarketIcon";
import AddToCartButton from "./AddToCartButton";
// import { woolworthsLinks, colesLinks, aldiLinks } from "./planTemplate";

interface PlanLayoutProps {
  planData?: PlanData;
  isLoading?: boolean;
}

function PlanLayout({
  planData = TEMPLATE_PLAN,
  isLoading = false,
}: PlanLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

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
        className="w-[70%] max-w-7xl flex flex-col p-16"
      >
        {/* Route Visualization - Two Column Layout */}
        <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Route Plan */}
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
                          <AddToCartButton
                            size="sm"
                            links={store.links || []}
                          />
                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              store.click_collect_available &&
                              store.min_spend_met
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {store.click_collect_available &&
                            store.min_spend_met
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

          {/* Right Column - Google Maps */}
          <div className="flex flex-col">
            {/* Receipt-Style Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-gray-300 rounded-lg shadow-lg mb-6 overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 text-center">
                <h2 className="text-2xl font-bold">ShopLyft</h2>
              </div>

              {/* Receipt Content */}
              <div className="p-4 space-y-3">
                {/* Original vs Optimized Comparison */}
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Original Route Cost:</span>
                    <span className="text-gray-500 line-through">
                      {isLoading
                        ? "..."
                        : `$${(
                            planData.total_cost + planData.total_savings
                          ).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Optimized Route Cost:</span>
                    <span className="font-semibold text-gray-800">
                      {isLoading ? "..." : `$${planData.total_cost.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Savings Highlight */}
                <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-green-700 font-bold text-lg mb-2">
                      You Saved with ShopLyft!
                    </div>
                    <div className="flex justify-center items-baseline space-x-4">
                      <div className="text-4xl font-bold text-green-600">
                        {isLoading
                          ? "..."
                          : `$${planData.total_savings.toFixed(2)}`}
                      </div>
                      <div className="text-4xl font-bold text-green-500">
                        {isLoading
                          ? "..."
                          : `(${(
                              (planData.total_savings /
                                (planData.total_cost +
                                  planData.total_savings)) *
                              100
                            ).toFixed(1)}%)`}
                      </div>
                    </div>
                    <div className="text-sm text-green-600 mt-2 font-medium">
                      OFF your original shopping cost
                    </div>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-orange-600 font-semibold">
                      {isLoading ? "..." : `${planData.total_time} min`}
                    </div>
                    <div className="text-orange-500 text-xs">Total Time</div>
                  </div>

                  {/* Add All to Cart Button */}
                  <button
                    onClick={() => {
                      // Find and click all AddToCartButton buttons
                      const buttons = document.querySelectorAll('[data-shoplyft-add-to-cart]');
                      buttons.forEach((btn) => {
                        (btn as HTMLButtonElement).click();
                      });
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex flex-col items-center justify-center"
                  >
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                      <span className="text-sm">Add All</span>
                    </div>
                    <div className="text-xs text-orange-100 mt-1 text-center">
                      {isLoading
                        ? "..."
                        : planData.stores.some(
                            (store) =>
                              !store.click_collect_available ||
                              !store.min_spend_met
                          )
                        ? "Some items cannot be click & collected"
                        : "All items available for click & collect"}
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-600">Route Map</h3>
              <button
                onClick={() => setIsMapExpanded(true)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
                <span>Expand Map</span>
              </button>
            </div>
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden h-96 cursor-pointer"
              onClick={() => setIsMapExpanded(true)}
            >
              <iframe
                src={`https://www.google.com/maps/embed/v1/directions?key=${
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                }&origin=${encodeURIComponent(
                  planData.starting_location.address
                )}&destination=${encodeURIComponent(
                  planData.stores[planData.stores.length - 1].store_info.address
                )}&waypoints=${planData.stores
                  .slice(0, -1)
                  .map((store) => encodeURIComponent(store.store_info.address))
                  .join("|")}&mode=walking`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shopping Route Map"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Map Modal */}
      {isMapExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsMapExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-orange-600">
                Shopping Route Map
              </h3>
              <button
                onClick={() => setIsMapExpanded(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Expanded Map */}
            <div className="h-[calc(100%-4rem)]">
              <iframe
                src={`https://www.google.com/maps/embed/v1/directions?key=${
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                }&origin=${encodeURIComponent(
                  planData.starting_location.address
                )}&destination=${encodeURIComponent(
                  planData.stores[planData.stores.length - 1].store_info.address
                )}&waypoints=${planData.stores
                  .slice(0, -1)
                  .map((store) => encodeURIComponent(store.store_info.address))
                  .join("|")}&mode=walking`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shopping Route Map - Expanded"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default PlanLayout;
