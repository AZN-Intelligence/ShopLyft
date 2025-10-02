import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NewLandingPage from "./components/LandingSection/LandingPage";
import PlanLayout from "./components/PlanSection/PlanLayout";
import LoadingScreen from "./components/LoadingSection/LoadingScreen";

function App() {
  const [currentStep, setCurrentStep] = useState<
    "landing" | "loading" | "roadmap"
  >("landing");
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigateToLoading = () => {
      setCurrentStep("loading");
      setLoadingError(null);
      setIsLoadingComplete(false);
    };

    const handleNavigateToPlan = (event: CustomEvent) => {
      console.log("Plan data received:", event.detail);
      // Store plan data for PlanLayout component
      // You can use context, state, or localStorage to pass this data
      if (event.detail.planData) {
        localStorage.setItem(
          "shoplyft_plan_data",
          JSON.stringify(event.detail.planData)
        );
      }

      // Trigger character exit animation
      setIsLoadingComplete(true);

      // After character exits, transition to roadmap
      setTimeout(() => {
        setCurrentStep("roadmap");
      }, 600); // Match the character exit duration
    };

    const handleOptimizationError = (event: CustomEvent) => {
      console.error("Optimization error:", event.detail.error);

      // Check if it's a server down error in production
      const isProduction = import.meta.env.VITE_MODE === "prod";
      const errorMessage =
        event.detail.error?.message || event.detail.error || "";
      const isServerDown = errorMessage.includes(
        "Server is currently unavailable"
      );
      console.warn("isServerDown", isServerDown);
      console.warn("isProduction", isProduction);
      console.warn("errorMessage", errorMessage);

      if (isProduction && isServerDown) {
        // In production, stay on loading screen to show error
        console.warn("Production error");
        setLoadingError(
          "ShopLyfter cannot contact our server. Please try again later."
        );
        // Don't trigger character exit animation for errors
        return;
      }

      // For parsing errors or other errors, show error bubble
      setLoadingError(errorMessage);
      return;
    };

    window.addEventListener(
      "navigateToLoading",
      handleNavigateToLoading as EventListener
    );

    window.addEventListener(
      "navigateToPlan",
      handleNavigateToPlan as EventListener
    );

    window.addEventListener(
      "optimizationError",
      handleOptimizationError as EventListener
    );

    return () => {
      window.removeEventListener(
        "navigateToLoading",
        handleNavigateToLoading as EventListener
      );
      window.removeEventListener(
        "navigateToPlan",
        handleNavigateToPlan as EventListener
      );
      window.removeEventListener(
        "optimizationError",
        handleOptimizationError as EventListener
      );
    };
  }, []);

  // Handle loading completion and transition to roadmap
  useEffect(() => {
    if (currentStep === "loading") {
      // The loading will be controlled by the optimization process
      // No need for automatic timeout since we're waiting for API response
      setIsLoadingComplete(false);
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
          <LoadingScreen
            isLoadingComplete={isLoadingComplete}
            loadingError={loadingError}
            onTryAgain={() => {
              setLoadingError(null);
              setCurrentStep("landing");
            }}
          />
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
