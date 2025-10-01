import { motion } from "framer-motion";
import { type PlanData } from "./planTemplate";

interface PlanHeaderProps {
  planData: PlanData;
  isLoading: boolean;
}

function PlanHeader({ planData, isLoading }: PlanHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border-2 border-gray-300 rounded-lg shadow-lg mb-6 md:mb-2 overflow-hidden"
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
                : `$${(planData.total_cost + planData.total_savings).toFixed(
                    2
                  )}`}
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
                {isLoading ? "..." : `$${planData.total_savings.toFixed(2)}`}
              </div>
              <div className="text-4xl font-bold text-green-500">
                {isLoading
                  ? "..."
                  : `(${(
                      (planData.total_savings /
                        (planData.total_cost + planData.total_savings)) *
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
              const buttons = document.querySelectorAll(
                "[data-shoplyft-add-to-cart]"
              );
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
                      !store.click_collect_available || !store.min_spend_met
                  )
                ? "Some items cannot be click & collected"
                : "All items available for click & collect"}
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanHeader;
