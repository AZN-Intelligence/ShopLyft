import { useState, useCallback } from "react";
import {
  apiService,
  type OptimizationRequest,
  type OptimizationResponse,
} from "../services/api";

export interface OptimizationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: OptimizationResponse | null;
  error: string | null;
  progress: number;
}

export interface OptimizationProgress {
  stage: "parsing" | "optimizing" | "generating" | "complete";
  message: string;
  progress: number;
}

export const useOptimization = () => {
  const [state, setState] = useState<OptimizationState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: null,
    error: null,
    progress: 0,
  });

  const [progress, setProgress] = useState<OptimizationProgress>({
    stage: "parsing",
    message: "Starting optimization...",
    progress: 0,
  });

  const optimizeShoppingPlan = useCallback(
    async (request: OptimizationRequest) => {
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
        progress: 0,
      });

      // Simulate progress updates during the 1-2 minute optimization
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 10, 90), // Cap at 90% until completion
        }));
      }, 2000);

      // Update progress messages
      const messageInterval = setInterval(() => {
        setProgress((prev) => {
          const stages = [
            {
              stage: "parsing" as const,
              message: "Parsing your shopping list...",
            },
            {
              stage: "optimizing" as const,
              message: "Finding the best stores and prices...",
            },
            {
              stage: "generating" as const,
              message: "Generating your optimized route...",
            },
            { stage: "complete" as const, message: "Almost done..." },
          ];

          const currentIndex = stages.findIndex((s) => s.stage === prev.stage);
          const nextIndex = Math.min(currentIndex + 1, stages.length - 1);

          return {
            ...prev,
            stage: stages[nextIndex].stage,
            message: stages[nextIndex].message,
            progress: Math.min(prev.progress + 5, 85),
          };
        });
      }, 15000); // Update message every 15 seconds

      try {
        console.log("[Optimization] Starting optimization request:", request);

        const response = await apiService.optimizeShoppingPlan(request);

        // Clear intervals
        clearInterval(progressInterval);
        clearInterval(messageInterval);

        console.log(
          "[Optimization] Optimization completed successfully:",
          response
        );

        // Check if the response indicates success
        if (!response.success) {
          console.error(
            "[Optimization] API returned success: false",
            response.message
          );

          setState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: null,
            error: response.message || "Failed to parse shopping list",
            progress: 0,
          });

          setProgress({
            stage: "parsing",
            message: response.message || "Failed to parse shopping list",
            progress: 0,
          });

          throw new Error(response.message || "Failed to parse shopping list");
        }

        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: response,
          error: null,
          progress: 100,
        });

        setProgress({
          stage: "complete",
          message: "Optimization complete!",
          progress: 100,
        });

        return response;
      } catch (error: unknown) {
        // Clear intervals
        clearInterval(progressInterval);
        clearInterval(messageInterval);

        console.error("[Optimization] Optimization failed:", error);

        // Check if it's a server connection error
        const errorObj = error as {
          code?: string;
          message?: string;
          response?: unknown;
        };
        const isServerDown =
          errorObj.code === "ECONNREFUSED" ||
          errorObj.code === "ERR_NETWORK" ||
          errorObj.message?.includes("Network Error") ||
          errorObj.message?.includes("fetch") ||
          !errorObj.response;

        if (isServerDown) {
          console.log(
            "[Optimization] Server appears to be down, handling gracefully"
          );

          // Wait 5 seconds before handling the error
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Check environment mode
          const isProduction = import.meta.env.VITE_MODE === "prod";

          if (isProduction) {
            // Production: Show error message
            const errorMessage =
              "Server is currently unavailable. Please try again later.";

            setState({
              isLoading: false,
              isSuccess: false,
              isError: true,
              data: null,
              error: errorMessage,
              progress: 0,
            });

            setProgress({
              stage: "parsing",
              message: "Server unavailable. Please try again later.",
              progress: 0,
            });
          } else {
            // Development: Use template data
            console.log("[Optimization] Development mode: Using template data");

            const templateResponse = {
              plan: {
                total_cost: 47.85,
                total_time: 24,
                travel_time: 18,
                shopping_time: 6,
                num_stores: 3,
                route_score: 0.8472,
                store_baskets: [
                  {
                    store_info: {
                      store_id: "store_001",
                      retailer_id: "woolworths",
                      name: "Woolworths Town Hall",
                      address:
                        "Shop 1248/Cnr Park Street &, George St, Sydney NSW 2000",
                      suburb: "Sydney",
                      postcode: "2000",
                      location: { lat: -33.871, lng: 151.206 },
                    },
                    items: [
                      {
                        item_requested: "2L milk",
                        product_name: "Woolworths Full Cream Milk 2L",
                        quantity: 1,
                        unit_price: 3.2,
                        line_total: 3.2,
                      },
                      {
                        item_requested: "wholemeal bread",
                        product_name: "Woolworths Wholemeal Bread",
                        quantity: 1,
                        unit_price: 2.7,
                        line_total: 2.7,
                      },
                      {
                        item_requested: "12 free-range eggs",
                        product_name: "Woolworths 12 X-Large Free Range Eggs",
                        quantity: 1,
                        unit_price: 6.6,
                        line_total: 6.6,
                      },
                    ],
                    subtotal: 12.5,
                    click_collect_eligible: true,
                    min_spend_required: 0,
                  },
                  {
                    store_info: {
                      store_id: "store_002",
                      retailer_id: "coles",
                      name: "Coles World Square",
                      address: "650 George St, Sydney NSW 2000",
                      suburb: "Sydney",
                      postcode: "2000",
                      location: { lat: -33.876, lng: 151.204 },
                    },
                    items: [
                      {
                        item_requested: "1.4kg chicken breast",
                        product_name: "Coles Chicken Breast 1.4kg",
                        quantity: 1,
                        unit_price: 15.4,
                        line_total: 15.4,
                      },
                      {
                        item_requested: "1kg rice",
                        product_name: "Coles Basmati Rice 1kg",
                        quantity: 1,
                        unit_price: 4.0,
                        line_total: 4.0,
                      },
                      {
                        item_requested: "tomatoes",
                        product_name: "Coles Tomatoes 1kg",
                        quantity: 1,
                        unit_price: 3.9,
                        line_total: 3.9,
                      },
                    ],
                    subtotal: 23.3,
                    click_collect_eligible: true,
                    min_spend_required: 0,
                  },
                  {
                    store_info: {
                      store_id: "store_003",
                      retailer_id: "aldi",
                      name: "ALDI Oxford Village",
                      address: "73 Oxford St, Darlinghurst NSW 2010",
                      suburb: "Darlinghurst",
                      postcode: "2010",
                      location: { lat: -33.876, lng: 151.212 },
                    },
                    items: [
                      {
                        item_requested: "organic bananas",
                        product_name: "ALDI Bananas 1kg",
                        quantity: 1,
                        unit_price: 3.99,
                        line_total: 3.99,
                      },
                      {
                        item_requested: "greek yogurt",
                        product_name: "ALDI Greek Yogurt 1kg",
                        quantity: 1,
                        unit_price: 6.49,
                        line_total: 6.49,
                      },
                    ],
                    subtotal: 10.48,
                    click_collect_eligible: false,
                    min_spend_required: 0,
                  },
                ],
                generated_at: new Date().toISOString(),
              },
              success: true,
              message: "Template plan loaded (server unavailable)",
            };

            setState({
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: templateResponse,
              error: null,
              progress: 100,
            });

            setProgress({
              stage: "complete",
              message: "Template plan loaded",
              progress: 100,
            });

            return templateResponse;
          }
        } else {
          // Regular API error (not server down)
          const errorMessage =
            (errorObj.response as { data?: { detail?: string } })?.data
              ?.detail ||
            errorObj.message ||
            "Optimization failed";

          setState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: null,
            error: errorMessage,
            progress: 0,
          });

          setProgress({
            stage: "parsing",
            message: "Optimization failed. Please try again.",
            progress: 0,
          });
        }

        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      data: null,
      error: null,
      progress: 0,
    });

    setProgress({
      stage: "parsing",
      message: "Starting optimization...",
      progress: 0,
    });
  }, []);

  return {
    ...state,
    progress,
    optimizeShoppingPlan,
    reset,
  };
};
