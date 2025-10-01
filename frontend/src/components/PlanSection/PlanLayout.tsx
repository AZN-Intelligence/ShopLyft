import { motion } from "framer-motion";
import { useState } from "react";
import { type PlanData, TEMPLATE_PLAN } from "./planTemplate";
import PlanHeader from "./PlanHeader";
import RoutePlan from "./RoutePlan";
import RouteMap from "./RouteMap";
import MobileToggle from "./MobileToggle";

interface PlanLayoutProps {
  planData?: PlanData;
  isLoading?: boolean;
}

function PlanLayout({
  planData = TEMPLATE_PLAN,
  isLoading = false,
}: PlanLayoutProps) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl flex flex-col p-4 md:p-8 lg:p-16"
      >
        {/* Desktop Layout (lg and above) */}
        <div className="hidden xl:grid h-[calc(100vh-12rem)] grid-cols-2 gap-6">
          {/* Left Column - Route Plan */}
          <div className="flex flex-col h-full">
            <RoutePlan planData={planData} isLoading={isLoading} />
          </div>

          {/* Right Column - Header + Map */}
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-2">
              <PlanHeader planData={planData} isLoading={isLoading} />
            </div>
            <div className="flex-1 min-h-0">
              <RouteMap
                planData={planData}
                isExpanded={isMapExpanded}
                onExpand={() => setIsMapExpanded(!isMapExpanded)}
              />
            </div>
          </div>
        </div>

        {/* Tablet Layout (md to lg) */}
        <div className="hidden md:grid xl:hidden h-[calc(100vh-12rem)] grid-cols-2 grid-rows-2 gap-6">
          {/* First Row - Route Plan */}
          <div className="flex flex-col h-full">
            <RoutePlan planData={planData} isLoading={isLoading} />
          </div>

          {/* First Row - Receipt Summary */}
          <div className="flex flex-col h-full">
            <PlanHeader planData={planData} isLoading={isLoading} />
          </div>

          {/* Second Row - Google Map (spans full width) */}
          <div className="col-span-2 flex flex-col h-full">
            <RouteMap
              planData={planData}
              isExpanded={isMapExpanded}
              onExpand={() => setIsMapExpanded(!isMapExpanded)}
            />
          </div>
        </div>

        {/* Mobile Layout (below md) */}
        <div className="md:hidden space-y-6">
          {/* First Row - Header */}
          <PlanHeader planData={planData} isLoading={isLoading} />

          {/* Second Row - Toggle between Route Plan and Map */}
          <MobileToggle
            planData={planData}
            isLoading={isLoading}
            isMapExpanded={isMapExpanded}
            onMapExpand={() => setIsMapExpanded(!isMapExpanded)}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default PlanLayout;
