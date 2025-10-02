import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface JumpingCharacterProps {
  isVisible?: boolean;
  onAnimationComplete?: () => void;
}

function JumpingCharacter({
  isVisible = true,
  onAnimationComplete,
}: JumpingCharacterProps) {
  const [showCharacter, setShowCharacter] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay the character appearance for dramatic effect
      const timer = setTimeout(() => {
        setShowCharacter(true);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setShowCharacter(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {showCharacter && (
        <motion.div
          initial={{
            x: "100vw",
            y: 0,
            scale: 0.8,
            rotate: -10,
          }}
          animate={{
            x: ["100vw", "20vw", "20vw", "-100vw"],
            y: [0, 0, -60, -30],
            scale: [0.8, 1, 1.1, 0.8],
            rotate: [-10, 0, 5, 15],
          }}
          exit={{
            x: "-100vw",
            y: -20,
            scale: 0.6,
            rotate: 20,
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: "easeIn",
            },
          }}
          transition={{
            x: {
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            },
            rotate: {
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            },
          }}
          onAnimationComplete={(definition) => {
            if (definition === "exit" && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
          className="fixed top-1/2 transform -translate-y-1/2 z-50 pointer-events-none"
        >
          {/* Character Image */}
          <motion.div
            animate={{
              rotate: [0, -2, 2, 0],
              scale: [1, 1.02, 0.98, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <img
              src="/src/assets/shoplyfter-jump-out.png"
              alt="ShopLyfter Character"
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-90 xl:h-90 object-contain"
            />

            {/* Celebration Effects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -top-4 -right-2 text-2xl"
            >
              ✨
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute -top-2 -left-4 text-xl"
            >
              🎉
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="absolute -bottom-2 -right-4 text-lg"
            >
              💫
            </motion.div>
          </motion.div>

          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{
              delay: 1.5,
              duration: 0.5,
              ease: "easeOut",
            }}
            className="absolute -top-20 -left-32 bg-white border-2 border-orange-400 rounded-2xl px-4 py-2 shadow-lg"
          >
            {/* Speech bubble tail */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-orange-400"></div>
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-orange-600 font-bold text-sm whitespace-nowrap"
            >
              Great savings! 🛒
            </motion.div>
          </motion.div>

          {/* Bouncing Shadow */}
          <motion.div
            animate={{
              scaleX: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.5, 0.2, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 w-20 h-6 bg-gray-400 rounded-full opacity-30 blur-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JumpingCharacter;
