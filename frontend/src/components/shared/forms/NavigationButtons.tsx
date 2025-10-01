import { motion } from "framer-motion";
import { type NavigationButtonsProps } from "../../types";

export default function NavigationButtons({
  onBack,
  onNext,
  backText = "Back",
  nextText,
  nextDisabled = false,
  showBack = true,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-4">
      {showBack && onBack ? (
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <span className="text-xl">←</span>
          <span>{backText}</span>
        </motion.button>
      ) : (
        <div></div>
      )}

      <motion.button
        onClick={onNext}
        disabled={nextDisabled}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors
          ${
            nextDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }
        `}
      >
        <span>{nextText}</span>
        <span className="text-xl">→</span>
      </motion.button>
    </div>
  );
}
