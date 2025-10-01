import { motion } from "framer-motion";
import { type ItemSelectionGridProps } from "../../types";

export default function ItemSelectionGrid({
  items,
  selectedItems,
  onToggleItem,
  label = "Quick Select Items",
}: ItemSelectionGridProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-orange-700 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <motion.button
              key={item}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleItem(item)}
              className={`
                p-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium
                ${
                  isSelected
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                    : "bg-white border-orange-200 text-orange-700 hover:border-orange-300 hover:bg-orange-50"
                }
              `}
            >
              <div className="flex items-center justify-center space-x-1">
                {isSelected && <span>✓</span>}
                <span className="truncate">{item}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
