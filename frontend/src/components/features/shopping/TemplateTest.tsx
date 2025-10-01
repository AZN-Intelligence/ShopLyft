import { TEMPLATE_PLAN } from "./planTemplate";
import PlanLayout from "./PlanLayout";

// Test component to verify template rendering
function TemplateTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Plan Template Test
        </h1>

        {/* Test with template data */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Template Data Preview
          </h2>
          <PlanLayout planData={TEMPLATE_PLAN} isLoading={false} />
        </div>

        {/* Test with loading state */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Loading State Preview
          </h2>
          <PlanLayout planData={TEMPLATE_PLAN} isLoading={true} />
        </div>

        {/* Raw data display */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Raw Template Data
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(TEMPLATE_PLAN, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TemplateTest;
