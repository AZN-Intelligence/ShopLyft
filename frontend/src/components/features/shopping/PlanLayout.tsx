import { motion } from "framer-motion";

interface PlanLayoutProps {
  planData?: any;
  isLoading?: boolean;
}

function PlanLayout({
  planData: _planData,
  isLoading = false,
}: PlanLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-orange-600 mb-2">
          Your Shopping Plan
        </h2>
        <p className="text-orange-700">Optimized for savings and efficiency</p>
      </div>

      {/* Savings Highlight */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-xl p-6 text-center"
      >
        <div className="text-4xl font-bold text-green-600 mb-2">
          {isLoading ? "..." : "$12.50"}
        </div>
        <div className="text-green-700 font-medium">Total Savings</div>
        <div className="text-sm text-green-600 mt-1">
          Compared to shopping at a single store
        </div>
      </motion.div>

      {/* Store Cards */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white border border-orange-200 rounded-lg p-6"
            >
              <div className="animate-pulse">
                <div className="h-6 bg-orange-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-orange-100 rounded w-full"></div>
                  <div className="h-4 bg-orange-100 rounded w-3/4"></div>
                  <div className="h-4 bg-orange-100 rounded w-1/2"></div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Actual store cards (placeholder for now)
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-orange-800">
                Woolworths
              </h3>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                Click & Collect Available
              </span>
            </div>
            <div className="space-y-2 text-orange-700">
              <div>• 2L Full Cream Milk - $3.60</div>
              <div>• Wholemeal Bread - $2.50</div>
              <div>• 12 Free-range Eggs - $4.20</div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-100 flex justify-between items-center">
              <span className="font-semibold text-orange-800">
                Subtotal: $10.30
              </span>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Time Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
      >
        <h4 className="font-semibold text-orange-800 mb-2">Time Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-orange-700">
          <div>
            <span className="font-medium">Travel Time:</span>{" "}
            {isLoading ? "..." : "15 min"}
          </div>
          <div>
            <span className="font-medium">Shopping Time:</span>{" "}
            {isLoading ? "..." : "25 min"}
          </div>
          <div>
            <span className="font-medium">Total Time:</span>{" "}
            {isLoading ? "..." : "40 min"}
          </div>
          <div>
            <span className="font-medium">Time Saved:</span>{" "}
            {isLoading ? "..." : "20 min"}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PlanLayout;
