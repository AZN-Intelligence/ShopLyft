import { motion } from "framer-motion";

interface ShoppingCartIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function ShoppingCartIcon({
  size = "md",
  className = "",
}: ShoppingCartIconProps) {
  const sizeClasses = {
    sm: "w-32 sm:w-40 text-4xl sm:text-5xl",
    md: "w-40 sm:w-56 text-5xl sm:text-7xl",
    lg: "w-40 sm:w-56 md:w-80 text-5xl sm:text-7xl md:text-9xl",
  };

  return (
    <motion.div
      className={`aspect-square max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-orange-200 via-white to-orange-400 shadow-2xl flex items-center justify-center ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <span className="text-orange-400 font-extrabold">🛒</span>
    </motion.div>
  );
}

export default ShoppingCartIcon;
