import { motion } from "framer-motion";

function FeatureContainers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="space-y-4"
    >
      {/* Save Money Feature */}
      <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-orange-800 text-lg">
              Save Money
            </h3>
            <p className="text-orange-600 text-sm">
              Find the best deals across major supermarkets
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save Time Feature */}
      <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-orange-800 text-lg">Save Time</h3>
            <p className="text-orange-600 text-sm">
              Get the optimal routes to pick up your groceries
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Optimized Feature */}
      <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-orange-800 text-lg">
              AI Optimized
            </h3>
            <p className="text-orange-600 text-sm">
              AI-powered decisions for every shopping trip
            </p>
          </div>
        </div>
      </motion.div>

      {/* Learn More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 border-2 border-orange-500 text-orange-500 font-semibold text-lg rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
          Learn more
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default FeatureContainers;
