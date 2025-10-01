import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./components/features/landing/LandingPage/LandingPage";
import ShoppingListForm from "./components/features/shopping/ShoppingListForm";
import TemplateTest from "./components/features/shopping/TemplateTest";

function App() {
  const [currentView, setCurrentView] = useState<
    "landing" | "shopping" | "test"
  >("landing");

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage onGetStarted={() => setCurrentView("shopping")} />;
      case "shopping":
        return <ShoppingListForm />;
      case "test":
        return <TemplateTest />;
      default:
        return <LandingPage onGetStarted={() => setCurrentView("shopping")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-neutral to-orange-300 flex flex-col ">
      {/* Test Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setCurrentView("landing")}
          className={`px-3 py-1 rounded text-sm ${
            currentView === "landing"
              ? "bg-orange-500 text-white"
              : "bg-white text-orange-500"
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setCurrentView("shopping")}
          className={`px-3 py-1 rounded text-sm ${
            currentView === "shopping"
              ? "bg-orange-500 text-white"
              : "bg-white text-orange-500"
          }`}
        >
          Shopping
        </button>
        <button
          onClick={() => setCurrentView("test")}
          className={`px-3 py-1 rounded text-sm ${
            currentView === "test"
              ? "bg-orange-500 text-white"
              : "bg-white text-orange-500"
          }`}
        >
          Test Template
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.7 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
