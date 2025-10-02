import { motion } from "framer-motion";

interface LoadingCharacterProps {
  isLoadingComplete: boolean;
}

export default function LoadingCharacter({
  isLoadingComplete,
}: LoadingCharacterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "100vw", scale: 0.8 }}
      animate={{
        opacity: isLoadingComplete ? 0 : 1,
        x: isLoadingComplete ? "-100vw" : 0,
        scale: 1,
        rotate: [0, -5, 5, 0],
      }}
      transition={{
        duration: isLoadingComplete ? 0.6 : 0.8,
        delay: isLoadingComplete ? 0 : 0.1,
        x: {
          duration: isLoadingComplete ? 0.6 : 0.8,
          ease: isLoadingComplete ? "easeIn" : "easeOut",
        },
        rotate: {
          duration: 0.8,
          repeat: isLoadingComplete ? 0 : Infinity,
          ease: "easeInOut",
          delay: isLoadingComplete ? 0 : 0.8,
        },
      }}
      className="mb-8 relative"
    >
      <div className="w-64 h-64 flex items-center justify-center mx-auto relative">
        <img
          src="/src/assets/shoplyfter-bg-removed.png"
          alt="ShopLyfter"
          className="w-full h-full object-contain scale-x-[-1]"
        />

        {/* Speed lines effect */}
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [20, 40, 60],
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute w-12 h-1 bg-orange-400 rounded-full"
              style={{ top: `${i * 6 - 12}px` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
