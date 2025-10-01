import { motion } from "framer-motion";
import FloatingMemo from "../LandingSection/FloatingMemo";

interface MobileFloatingMemoProps {
  onSend: (text: string, location: string) => void;
}

function MobileFloatingMemo({ onSend }: MobileFloatingMemoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="flex justify-center mb-8"
    >
      <div className="w-[80vw] max-w-md h-[65vh]">
        <FloatingMemo onSend={onSend} />
      </div>
    </motion.div>
  );
}

export default MobileFloatingMemo;
