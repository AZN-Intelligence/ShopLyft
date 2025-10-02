import { motion } from "framer-motion";

interface ErrorBubbleProps {
  loadingError: string;
  onTryAgain: () => void;
}

export default function ErrorBubble({
  loadingError,
  onTryAgain,
}: ErrorBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      className="relative mb-8 max-w-sm sm:max-w-md mx-auto px-4"
    >
      {/* Speech Bubble with Comic Style */}
      <div className="relative">
        {/* Main Bubble */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-3 border-orange-400 rounded-3xl px-4 py-4 sm:px-8 sm:py-6 shadow-2xl relative transform rotate-1 flex flex-col items-center">
          {/* Comic Dots Pattern */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-orange-300 rounded-full opacity-60"></div>
          <div className="absolute top-4 right-4 w-1 h-1 bg-orange-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-50"></div>

          {/* Character Image and Effects (inside bubble) */}
          <motion.div
            animate={{
              rotate: [0, -2, 2, 0],
              y: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              },
            }}
            className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto -mt-2 mb-2 sm:-mt-4 sm:mb-4 opacity-100"
          >
            <img
              src="/src/assets/shoplyfter-error.png"
              alt="ShopLyfter Character"
              className="w-full h-full object-contain"
            />
            {/* Exhaustion Lines */}
            <div className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 0.6, 0],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-6 sm:w-8 h-0.5 bg-gray-400 rounded-full"
                  style={{ left: `${i * 4 - 6}px` }}
                />
              ))}
            </div>

            {/* Sweat Drops */}
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-6 right-16 sm:top-8 sm:right-24 text-base sm:text-lg"
            >
              💧
            </motion.div>

            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute top-8 right-12 sm:top-12 sm:right-20 text-sm"
            >
              💧
            </motion.div>
          </motion.div>

          {/* Error Content */}
          <div className="text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-gray-800 font-bold mb-2 text-base sm:text-lg"
            >
              Yikes!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-5 leading-relaxed px-2"
            >
              {loadingError}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.4,
                duration: 0.3,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTryAgain}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🔄 Try Again
            </motion.button>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-lg sm:text-2xl"
        >
          💥
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -top-1 -left-2 sm:-left-3 text-base sm:text-xl"
        >
          ⚡
        </motion.div>
      </div>
    </motion.div>
  );
}
