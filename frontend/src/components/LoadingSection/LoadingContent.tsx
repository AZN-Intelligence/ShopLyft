import { motion } from "framer-motion";

interface LoadingContentProps {
  isLoadingComplete: boolean;
}

export default function LoadingContent({
  isLoadingComplete,
}: LoadingContentProps) {
  return (
    <>
      {/* Loading Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isLoadingComplete ? 0 : 1,
          y: 0,
        }}
        transition={{
          delay: isLoadingComplete ? 0 : 0.2,
          duration: isLoadingComplete ? 0.3 : 0.3,
        }}
        className="text-2xl font-semibold text-gray-800 mb-4"
      >
        Working on your plan...
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isLoadingComplete ? 0 : 1,
          y: 0,
        }}
        transition={{
          delay: isLoadingComplete ? 0 : 0.3,
          duration: isLoadingComplete ? 0.3 : 0.3,
        }}
        className="text-lg text-gray-600 mb-8"
      >
        Finding the best stores and routes for you
      </motion.div>

      {/* Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoadingComplete ? 0 : 1,
        }}
        transition={{
          delay: isLoadingComplete ? 0 : 0.4,
          duration: isLoadingComplete ? 0.3 : 0.3,
        }}
        className="flex justify-center space-x-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: isLoadingComplete ? 0 : [1, 1.2, 1],
              opacity: isLoadingComplete ? 0 : [0.5, 1, 0.5],
            }}
            transition={{
              duration: isLoadingComplete ? 0.3 : 1.5,
              repeat: isLoadingComplete ? 0 : Infinity,
              delay: isLoadingComplete ? 0 : i * 0.2,
              ease: "easeInOut",
            }}
            className="w-3 h-3 bg-orange-500 rounded-full"
          />
        ))}
      </motion.div>
    </>
  );
}
