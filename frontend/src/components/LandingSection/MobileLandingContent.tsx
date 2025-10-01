import { motion } from "framer-motion";
import ProductTitle from "../LandingSection/ProductTitle";
import MobileFloatingMemo from "../LandingSection/MobileFloatingMemo";
import FeatureContainers from "../LandingSection/FeatureContainers";

interface MobileLandingContentProps {
  onSend: (text: string, location: string) => void;
}

function MobileLandingContent({ onSend }: MobileLandingContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* 1. Product Title */}
      <ProductTitle />

      {/* 2. Floating Memo with 80vw width */}
      <MobileFloatingMemo onSend={onSend} />

      {/* 3. Feature Containers and Learn More Button */}
      <FeatureContainers />
    </motion.div>
  );
}

export default MobileLandingContent;
