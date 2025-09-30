import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./LandingPage";

function CardContainer() {
  return (
    <div className="min-h-screen flex item-center justify-center py-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center justify-center min-h-[40vh] w-full md:w-[32rem] mx-auto bg-white rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-orange-600">
          Enter Your Shopping List
        </h2>
        <input
          className="w-full border border-orange-300 rounded-lg p-3 mb-4"
          placeholder="e.g. milk, eggs, bread"
        />
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-colors duration-200">
          Submit
        </button>
      </motion.div>
    </div>
  );
}

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
          <CardContainer key="card" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
