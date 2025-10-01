import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./components/features/landing/LandingPage/LandingPage";
import ShoppingListForm from "./components/features/shopping/ShoppingListForm";

function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-neutral to-orange-300 flex flex-col ">
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.7 }}
          >
            <LandingPage onGetStarted={() => setShowLanding(false)} />
          </motion.div>
        ) : (
          <ShoppingListForm key="shopping" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
