import { motion } from "framer-motion";
import { type PlanData } from "./planTemplate";

interface RouteMapProps {
  planData: PlanData;
  isExpanded: boolean;
  onExpand: () => void;
}

function RouteMap({ planData, isExpanded, onExpand }: RouteMapProps) {
  // Construct waypoints with validation
  const constructWaypoints = () => {
    if (!planData.stores || planData.stores.length <= 1) {
      return ""; // No waypoints needed if only one store or no stores
    }

    // Get all stores except the last one (which is the destination)
    const waypointStores = planData.stores.slice(0, -1);

    // Filter out any stores with invalid addresses and clean them
    const validWaypoints = waypointStores
      .filter(
        (store) => store.store_info?.address && store.store_info.address.trim()
      )
      .map((store) => {
        // Clean the address and encode it properly
        const cleanAddress = store.store_info.address
          .trim()
          .replace(/\s+/g, " "); // Replace multiple spaces with single space
        // Don't remove special characters as Google Maps can handle most of them
        return encodeURIComponent(cleanAddress);
      });

    // Google Maps Embed API supports up to 23 waypoints
    const limitedWaypoints = validWaypoints.slice(0, 23);

    return limitedWaypoints.length > 0 ? limitedWaypoints.join("|") : "";
  };

  const waypoints = constructWaypoints();
  const waypointsParam = waypoints ? `&waypoints=${waypoints}` : "";

  // Debug logging to help identify issues
  console.log("RouteMap Debug:", {
    storesCount: planData.stores?.length || 0,
    waypoints: waypoints,
    waypointsLength: waypoints.length,
    origin: planData.starting_location?.address,
    destination:
      planData.stores?.[planData.stores.length - 1]?.store_info?.address,
    allStoreAddresses: planData.stores?.map((s) => s.store_info?.address),
    finalMapUrl: `https://www.google.com/maps/embed/v1/directions?key=***&origin=${encodeURIComponent(
      planData.starting_location.address
    )}&destination=${encodeURIComponent(
      planData.stores[planData.stores.length - 1].store_info.address
    )}${waypointsParam}&mode=walking`,
  });

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-orange-600">Route Map</h3>
        <button
          onClick={onExpand}
          className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          <span>Expand Map</span>
        </button>
      </div>
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden h-64 md:h-80 lg:h-96 cursor-pointer"
        onClick={onExpand}
      >
        <iframe
          src={`https://www.google.com/maps/embed/v1/directions?key=${
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          }&origin=${encodeURIComponent(
            planData.starting_location.address
          )}&destination=${encodeURIComponent(
            planData.stores[planData.stores.length - 1].store_info.address
          )}${waypointsParam}&mode=walking`}
          onError={() => {
            console.error(
              "Google Maps iframe failed to load, possibly due to waypoints issue"
            );
          }}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Shopping Route Map"
        />
      </div>

      {/* Expanded Map Modal */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => onExpand()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-orange-600">
                Shopping Route Map
              </h3>
              <button
                onClick={() => onExpand()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Expanded Map */}
            <div className="h-[calc(100%-4rem)]">
              <iframe
                src={`https://www.google.com/maps/embed/v1/directions?key=${
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                }&origin=${encodeURIComponent(
                  planData.starting_location.address
                )}&destination=${encodeURIComponent(
                  planData.stores[planData.stores.length - 1].store_info.address
                )}${waypointsParam}&mode=walking`}
                onError={() => {
                  console.error(
                    "Google Maps expanded iframe failed to load, possibly due to waypoints issue"
                  );
                }}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shopping Route Map - Expanded"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default RouteMap;
