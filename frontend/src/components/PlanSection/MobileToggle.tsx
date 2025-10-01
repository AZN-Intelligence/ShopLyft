import { useState } from "react";
import { motion } from "framer-motion";
import RoutePlan from "./RoutePlan";
import RouteMap from "./RouteMap";
import { type PlanData } from "./planTemplate";

interface MobileToggleProps {
  planData: PlanData;
  isLoading: boolean;
  isMapExpanded: boolean;
  onMapExpand: () => void;
}

function MobileToggle({
  planData,
  isLoading,
  isMapExpanded,
  onMapExpand,
}: MobileToggleProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "map">("plan");

  return (
    <div className="w-full">
      {/* Toggle Buttons */}
      <div className="flex bg-orange-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab("plan")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "plan"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-orange-500 hover:text-orange-600"
          }`}
        >
          Route Plan
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "map"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-orange-500 hover:text-orange-600"
          }`}
        >
          Route Map
        </button>
      </div>

      {/* Content Area */}
      <div className="relative h-[50vh] md:h-[55vh]">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "plan" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {activeTab === "plan" ? (
            <RoutePlan planData={planData} isLoading={isLoading} />
          ) : (
            <RouteMap
              planData={planData}
              isExpanded={isMapExpanded}
              onExpand={onMapExpand}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default MobileToggle;
