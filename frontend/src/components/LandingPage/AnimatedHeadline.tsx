import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedHeadlineProps {
  headlines: string[];
  interval?: number;
  className?: string;
  textAlign?: "left" | "center" | "right";
}

function AnimatedHeadline({
  headlines,
  interval = 2200,
  className = "",
  textAlign = "center",
}: AnimatedHeadlineProps) {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % headlines.length);
    }, interval);
    return () => clearInterval(intervalId);
  }, [headlines.length, interval]);

  const textAlignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={`mb-2 flex items-center ${textAlignClasses[textAlign]}`}
      style={{ minHeight: "4.8rem" }}
    >
      <AnimatePresence mode="wait">
        <motion.h2
          key={headlineIndex}
          className={`font-extrabold text-orange-600 drop-shadow-lg w-full h-full whitespace-nowrap overflow-hidden text-ellipsis ${className}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7 }}
          style={{ display: "block", width: "100%" }}
        >
          {headlines[headlineIndex]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}

export default AnimatedHeadline;
