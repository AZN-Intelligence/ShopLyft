import { motion } from "framer-motion";
import ErrorBubble from "./ErrorBubble";
import LoadingCharacter from "./LoadingCharacter";
import LoadingContent from "./LoadingContent";

interface LoadingScreenProps {
  isLoadingComplete: boolean;
  loadingError: string | null;
  onTryAgain: () => void;
}

export default function LoadingScreen({
  isLoadingComplete,
  loadingError,
  onTryAgain,
}: LoadingScreenProps) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoadingComplete ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center relative"
    >
      {/* Loading Content */}
      <div className="text-center">
        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isLoadingComplete && !loadingError ? 0 : 1,
            y: 0,
          }}
          transition={{
            delay: isLoadingComplete && !loadingError ? 0 : 0.2,
            duration: isLoadingComplete && !loadingError ? 0.3 : 0.5,
          }}
          className="text-5xl font-bold text-orange-600 mb-8"
        >
          SHOPLYFT
        </motion.div>

        {/* Error Bubble */}
        {loadingError && (
          <ErrorBubble loadingError={loadingError} onTryAgain={onTryAgain} />
        )}

        {/* Loading Character */}
        {!loadingError && (
          <LoadingCharacter isLoadingComplete={isLoadingComplete} />
        )}

        {/* Loading Content */}
        {!loadingError && (
          <LoadingContent isLoadingComplete={isLoadingComplete} />
        )}
      </div>

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
    </motion.div>
  );
}
