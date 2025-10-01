import { useState } from "react";
import { motion } from "framer-motion";
import DesktopLandingContent from "./DesktopLandingContent";
import MobileLandingContent from "./MobileLandingContent";
import FloatingMemo from "../LandingSection/FloatingMemo";

function NewLandingPage() {
  const [shoppingList, setShoppingList] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSendList = (text: string, location: string) => {
    setShoppingList(text);
    setIsAnimating(true);
    console.log("Shopping list submitted:", text, "Location:", location);
    // Navigate to loading screen after animation completes
    setTimeout(() => {
      // This will be handled by the parent component
      window.dispatchEvent(
        new CustomEvent("navigateToLoading", {
          detail: {
            shoppingList: text,
            location: location,
          },
        })
      );
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Desktop Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isAnimating ? 0 : 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:grid grid-cols-2 gap-16 items-center"
        >
          {/* Left Side - Landing Content */}
          <div>
            <DesktopLandingContent />
          </div>

          {/* Right Side - Floating Memo */}
          <div className="flex justify-end h-full pt-16">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-[30vw] max-w-4xl mx-auto"
            >
              <FloatingMemo onSend={handleSendList} />
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isAnimating ? 0 : 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:hidden"
        >
          <MobileLandingContent onSend={handleSendList} />
        </motion.div>

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
      </div>
    </div>
  );
}

export default NewLandingPage;
