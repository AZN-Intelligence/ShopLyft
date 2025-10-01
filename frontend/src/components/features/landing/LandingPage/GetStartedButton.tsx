import { motion } from "framer-motion";

interface GetStartedButtonProps {
  onClick: () => void;
  variant?: "mobile" | "desktop";
  className?: string;
}

function GetStartedButton({
  onClick,
  variant = "mobile",
  className = "",
}: GetStartedButtonProps) {
  const variantClasses = {
    mobile:
      "mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition-colors duration-200",
    desktop:
      "mt-8 min-w-68 px-10 py-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl shadow-xl transition-all duration-200 hover:shadow-2xl",
  };

  const animationProps = {
    mobile: { whileTap: { scale: 0.95 } },
    desktop: { whileTap: { scale: 0.95 }, whileHover: { scale: 1.05 } },
  };

  return (
    <motion.button
      className={`${variantClasses[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      {...animationProps[variant]}
      onClick={onClick}
    >
      Get Started
    </motion.button>
  );
}

export default GetStartedButton;
