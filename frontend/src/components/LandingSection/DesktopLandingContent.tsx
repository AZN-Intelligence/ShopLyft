import { motion } from "framer-motion";
import ProductTitle from "../LandingSection/ProductTitle";
import FeatureContainers from "../LandingSection/FeatureContainers";

function DesktopLandingContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg"
    >
      <ProductTitle />
      <FeatureContainers />
    </motion.div>
  );
}

export default DesktopLandingContent;
