import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const headlines = [
  "Save More. Shop Smarter.",
  "Plan Your Grocery Route.",
  "Maximize Your Savings.",
  "Fast, Cheap, and Easy Shopping.",
];

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % headlines.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex-1 flex flex-col md:flex-row items-center justify-center px-2 md:px-16 py-8 md:py-12 gap-8 md:gap-24">
      {/* Mobile: icon first, wording second; Desktop: wording first, icon second */}
      <div className="block md:hidden w-full flex flex-col items-center gap-8">
        <motion.div
          className="aspect-square w-40 sm:w-56 max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-orange-200 via-white to-orange-400 shadow-2xl flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="text-5xl sm:text-7xl text-orange-400 font-extrabold">
            🛒
          </span>
        </motion.div>
        <div className="w-full flex flex-col justify-center items-center text-center">
          <div
            className="mb-2 flex items-center"
            style={{ minHeight: "4.8rem" }}
          >
            <AnimatePresence mode="wait">
              <motion.h2
                key={headlineIndex}
                className="text-2xl sm:text-3xl font-extrabold text-orange-600 drop-shadow-lg w-full h-full whitespace-nowrap overflow-hidden text-ellipsis text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.7 }}
                style={{ display: "block", width: "100%" }}
              >
                {headlines[headlineIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <motion.p
            className="text-base sm:text-lg text-orange-700 mt-2 max-x-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            ShopLyft helps you plan the cheapest and fastest grocery run across
            Woolworths, Coles, and ALDI. Get an optimal route, basket, and
            savings—all in one click.
          </motion.p>
          <motion.button
            className="mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
          >
            Get Started
          </motion.button>
        </div>
      </div>

      {/* Desktop: wording first, icon second */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-start text-left pl-10">
        <div className="mb-2 flex items-center" style={{ minHeight: "4.8rem" }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={headlineIndex}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-orange-600 drop-shadow-lg w-full h-full whitespace-nowrap overflow-hidden text-ellipsis"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7 }}
              style={{ display: "block", width: "100%" }}
            >
              {headlines[headlineIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>
        <motion.p
          className="text-base sm:text-lg md:text-2xl text-orange-700 mt-2 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          ShopLyft helps you plan the cheapest and fastest grocery run across
          Woolworths, Coles, and ALDI. Get an optimal route, basket, and
          savings—all in one click.
        </motion.p>
        <motion.button
          className="mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition-colors duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
        >
          Get Started
        </motion.button>
      </div>
      <motion.div
        className="hidden md:flex aspect-square w-40 sm:w-56 md:w-80 max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-orange-200 via-white to-orange-400 shadow-2xl items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <span className="text-5xl sm:text-7xl md:text-9xl text-orange-400 font-extrabold">
          🛒
        </span>
      </motion.div>
    </section>
  );
}

export default LandingPage;
