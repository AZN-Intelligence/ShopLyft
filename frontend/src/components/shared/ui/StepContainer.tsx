import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface StepContainerProps {
  children: ReactNode;
  className?: string;
}

export default function StepContainer({
  children,
  className = "",
}: StepContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
