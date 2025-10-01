import { motion, AnimatePresence } from "framer-motion";
import { type LocationSelectorProps } from "../../types";

export default function LocationSelector({
  useCurrentLocation,
  onLocationOptionChange,
  currentLocation,
  manualLocation,
  onManualLocationChange,
}: LocationSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Current Location Option */}
      <button
        onClick={() => onLocationOptionChange(true)}
        className={`w-full p-4 rounded-lg border-2 transition-colors ${
          useCurrentLocation
            ? "border-orange-500 bg-orange-50 text-orange-700"
            : "border-orange-200 bg-white text-orange-600 hover:border-orange-300"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              useCurrentLocation
                ? "border-orange-500 bg-orange-500"
                : "border-orange-300"
            }`}
          >
            {useCurrentLocation && (
              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">📍 Use my current location</div>
            {currentLocation && (
              <div className="text-sm text-orange-600">
                Location detected: {currentLocation.lat.toFixed(4)},{" "}
                {currentLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Manual Location Option */}
      <button
        onClick={() => onLocationOptionChange(false)}
        className={`w-full p-4 rounded-lg border-2 transition-colors ${
          !useCurrentLocation
            ? "border-orange-500 bg-orange-50 text-orange-700"
            : "border-orange-200 bg-white text-orange-600 hover:border-orange-300"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              !useCurrentLocation
                ? "border-orange-500 bg-orange-500"
                : "border-orange-300"
            }`}
          >
            {!useCurrentLocation && (
              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">✏️ Enter my postcode or suburb</div>
            <div className="text-sm text-orange-600">
              Type your location manually
            </div>
          </div>
        </div>
      </button>

      {/* Manual Location Input */}
      <AnimatePresence>
        {!useCurrentLocation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => onManualLocationChange(e.target.value)}
              placeholder="e.g., 2000, Sydney CBD, Bondi Junction"
              className="w-full border border-orange-300 rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
