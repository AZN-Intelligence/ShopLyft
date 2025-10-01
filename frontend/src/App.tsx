import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NewLandingPage from "./components/LandingSection/LandingPage";
import PlanLayout from "./components/PlanSection/PlanLayout";

function App() {
  const [currentStep, setCurrentStep] = useState<
    "landing" | "loading" | "roadmap"
  >("landing");
  const [shoppingList, setShoppingList] = useState<string>("");
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    const handleNavigateToLoading = (event: CustomEvent) => {
      setShoppingList(event.detail.shoppingList);
      setCurrentStep("loading");
    };

    window.addEventListener(
      "navigateToLoading",
      handleNavigateToLoading as EventListener
    );

    return () => {
      window.removeEventListener(
        "navigateToLoading",
        handleNavigateToLoading as EventListener
      );
    };
  }, []);

  // Handle loading completion and transition to roadmap
  useEffect(() => {
    if (currentStep === "loading") {
      const timer = setTimeout(() => {
        setIsLoadingComplete(true);
        // After character exits, transition to roadmap
        setTimeout(() => {
          setCurrentStep("roadmap");
        }, 1000);
      }, 5000); // 5 second delay

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentStep === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NewLandingPage />
          </motion.div>
        )}

        {currentStep === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoadingComplete ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center relative"
          >
            {/* Loading Content */}
            <div className="text-center">
              {/* Brand Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-5xl font-bold text-orange-600 mb-8"
              >
                SHOPLYFT
              </motion.div>

              {/* Animated ShopLyfter Character */}
              <motion.div
                initial={{ opacity: 0, x: "100vw", scale: 0.8 }}
                animate={{
                  opacity: isLoadingComplete ? 0 : 1,
                  x: isLoadingComplete ? "-100vw" : 0,
                  scale: 1,
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  x: {
                    duration: 0.8,
                    ease: "easeOut",
                  },
                  rotate: {
                    duration: 0.8,
                    repeat: isLoadingComplete ? 0 : Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
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

              {/* Loading Messages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-2xl font-semibold text-gray-800 mb-4"
              >
                Working on your plan...
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-lg text-gray-600 mb-8"
              >
                Finding the best stores and routes for you
              </motion.div>

              {/* Loading Dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex justify-center space-x-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-3 h-3 bg-orange-500 rounded-full"
                  />
                ))}
              </motion.div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-20"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-200 rounded-full opacity-20"
              />
            </div>
          </motion.div>
        )}

        {currentStep === "roadmap" && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlanLayout />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
