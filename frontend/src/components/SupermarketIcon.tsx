import { motion } from "framer-motion";

interface SupermarketIconProps {
  retailerId: string;
  size?: "sm" | "md" | "lg";
}

const SupermarketIcon = ({ retailerId, size = "md" }: SupermarketIconProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6";
      case "lg":
        return "w-12 h-12";
      default:
        return "w-8 h-8";
    }
  };

  const getIcon = () => {
    switch (retailerId) {
      case "woolworths":
        return (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${getSizeClasses()} bg-green-500 rounded-full flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">W</span>
          </motion.div>
        );
      case "coles":
        return (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${getSizeClasses()} bg-red-500 rounded-full flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">C</span>
          </motion.div>
        );
      case "aldi":
        return (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${getSizeClasses()} bg-blue-500 rounded-full flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">A</span>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${getSizeClasses()} bg-gray-500 rounded-full flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">?</span>
          </motion.div>
        );
    }
  };

  return getIcon();
};

export default SupermarketIcon;
