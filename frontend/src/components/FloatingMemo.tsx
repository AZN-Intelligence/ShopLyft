import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingMemoProps {
  onSend: (text: string) => void;
}

function FloatingMemo({ onSend }: FloatingMemoProps) {
  const [text, setText] = useState("");
  const [isFlying, setIsFlying] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      setIsFlying(true);
      setTimeout(() => {
        onSend(text);
        setText("");
        setIsFlying(false);
      }, 1800); // Reduced to 1.8 seconds for faster animation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-[30vw] max-w-4xl mx-auto">
      <AnimatePresence>
        {!isFlying && (
          <motion.div
            key="memo"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [0, -2, 0, 1, 0, -1, 0], // Subtle floating animation
            }}
            exit={{
              opacity: 0,
              scale: 0.3,
            }}
            transition={{
              duration: 0.3,
              delay: 0.6, // Match absorption timing
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="relative"
          >
            {/* Memo Paper Background */}
            <div className="relative bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-10 min-h-[500px]">
              {/* Red Margin Line */}
              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300"></div>

              {/* Blue Lines */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-0.5 bg-blue-200"
                    style={{
                      top: `${56 + i * 32}px`, // Start after padding + margin line
                      left: "80px", // Align with text (p-10 + pl-20 = 40px + 40px = 80px)
                      right: "40px", // End before right padding
                      opacity: 0.6 + Math.random() * 0.3,
                    }}
                  ></div>
                ))}
              </div>

              {/* Text Input */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  "Write your shopping list here...\n\nExample:\n• 2L milk\n• Bread\n• 1kg chicken breast\n• Tomatoes\n• Rice"
                }
                className="absolute inset-0 bg-transparent border-none outline-none resize-none p-10 pt-9.5 pl-20 text-orange-800 placeholder-orange-400 font-mono text-xl leading-9"
                style={{
                  lineHeight: "1.5rem",
                }}
              />

              {/* Paper Holes */}
              <div className="absolute left-8 top-16 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
              <div className="absolute left-8 top-24 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
              <div className="absolute left-8 top-32 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Large Object Animation */}
      <AnimatePresence>
        {isFlying && (
          <motion.div
            key="largeObject"
            initial={{ opacity: 0, x: "100vw", y: 0, scale: 1 }}
            animate={{
              opacity: 1,
              x: "15vw", // Stop at the memo position (right side)
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: "-100vw", // Exit to the left
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              x: {
                duration: 0.8,
                ease: "easeInOut",
              },
            }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            {/* Large Object - Placeholder */}
            <div className="relative">
              {/* ShopLyfter Character */}
              <motion.div
                animate={{
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-80 h-80 flex items-center justify-center"
              >
                <img
                  src="/src/assets/shoplyfter-bg-removed.png"
                  alt="ShopLyfter"
                  className="w-full h-full object-contain scale-x-[-1]"
                />
              </motion.div>

              {/* Absorption effect - memo being absorbed */}
              <motion.div
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 0.3,
                  y: -20,
                }}
                transition={{
                  delay: 0.6, // Start absorption after object arrives
                  duration: 0.3,
                  ease: "easeIn",
                }}
                className="absolute inset-0 bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-10 min-h-[500px]"
              >
                <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300"></div>
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-0.5 bg-blue-200"
                      style={{
                        top: `${56 + i * 32}px`,
                        left: "80px",
                        right: "40px",
                        opacity: 0.6 + Math.random() * 0.3,
                      }}
                    ></div>
                  ))}
                </div>
                <div className="absolute inset-0 p-10 pl-20 text-orange-800 font-mono text-xl leading-9 whitespace-pre-wrap">
                  {text}
                </div>
                <div className="absolute left-8 top-16 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
                <div className="absolute left-8 top-24 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
                <div className="absolute left-8 top-32 w-3 h-3 bg-gray-300 rounded-full opacity-60"></div>
              </motion.div>

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
                      duration: 0.8,
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
        )}
      </AnimatePresence>
    </div>
  );
}

export default FloatingMemo;
