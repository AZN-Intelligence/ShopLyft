import { motion } from "framer-motion";

function ProductTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-8"
    >
      {/* Product Name - Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-6xl md:text-8xl font-bold text-orange-600 mb-4 leading-tight"
      >
        SHOPLYFT
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-2xl md:text-4xl font-semibold text-orange-500 leading-relaxed"
      >
        Groceries at a steal! ✨
      </motion.h2>
    </motion.div>
  );
}

export default ProductTitle;
