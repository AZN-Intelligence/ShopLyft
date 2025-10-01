import { motion, AnimatePresence } from "framer-motion";
import { type CustomInputToggleProps } from "../../types";

export default function CustomInputToggle({
  showDetails,
  onToggle,
  customInput,
  onInputChange,
  placeholder = "e.g., 2L milk, 1kg chicken (organic), bananas (free-range), bread...",
  tip = '💡 Tip: Include quantities, sizes, and use (parentheses) for notes. Example: "2L milk, 1kg chicken (organic), bananas (free-range)"',
}: CustomInputToggleProps) {
  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-center space-x-3">
        <button
          type="button"
          onClick={() => onToggle(!showDetails)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border-0
            ${showDetails ? "bg-orange-500" : "bg-gray-300"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${showDetails ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
        <label className="text-base text-orange-700 font-semibold">
          Add items by yourself?
        </label>
      </div>

      {/* Input Field */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-orange-700 mb-2">
                Add specific items with quantities
              </label>
              <textarea
                value={customInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-orange-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-sm text-orange-600 mt-2">{tip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
