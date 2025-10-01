import { motion } from "framer-motion";

interface LandingContentProps {
  description: string;
  className?: string;
  textAlign?: "left" | "center";
}

function LandingContent({
  description,
  className = "",
  textAlign = "center",
}: LandingContentProps) {
  const textAlignClasses = {
    left: "text-left",
    center: "text-center",
  };

  const textSizeClasses = {
    left: "text-base sm:text-lg md:text-2xl",
    center: "text-base sm:text-lg",
  };

  return (
    <motion.p
      className={`${textSizeClasses[textAlign]} text-orange-700 mt-2 max-w-2xl ${textAlignClasses[textAlign]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      {description}
    </motion.p>
  );
}

export default LandingContent;
