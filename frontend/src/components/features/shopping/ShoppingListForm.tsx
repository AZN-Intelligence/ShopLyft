import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardContainer from "../../shared/layout/CardContainer";
import StepContainer from "../../shared/ui/StepContainer";
import StepHeader from "../../shared/forms/StepHeader";
import NavigationButtons from "../../shared/forms/NavigationButtons";
import ItemSelectionGrid from "./ItemSelectionGrid";
import CustomInputToggle from "./CustomInputToggle";
import ItemDetailsForm from "./ItemDetailsForm";
import LocationSelector from "./LocationSelector";
import ShoppingListTable from "./ShoppingListTable";
import LoadingAnimation from "./LoadingAnimation";
import PlanLayout from "./PlanLayout";
import {
  type ShoppingListItem,
  type FormStep,
  type LocationData,
} from "../../types";

// Common grocery items for quick selection
const commonItems = [
  "Milk",
  "Eggs",
  "Bread",
  "Butter",
  "Cheese",
  "Chicken",
  "Rice",
  "Pasta",
  "Tomatoes",
  "Potatoes",
  "Apples",
  "Bananas",
  "Toilet Paper",
  "Coffee",
  "Yogurt",
  "Orange Juice",
  "Cereal",
  "Spinach",
  "Carrots",
  "Onions",
];

function ShoppingListForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>("items");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [location, setLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [, setIsLoading] = useState(false);
  const [detailsItems, setDetailsItems] = useState<ShoppingListItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );

  const toggleItem = (item: string) => {
    const isCurrentlySelected = selectedItems.includes(item);

    if (isCurrentlySelected) {
      // Remove item from selection
      setSelectedItems((prev) => prev.filter((i) => i !== item));

      // Remove from custom input
      setCustomInput((prev) => {
        const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Handle both cases: item at start (no comma) and item in middle/end (with comma)
        const itemPattern = new RegExp(`(^|,\\s*)${escapedItem}(?=,|$)`, "g");
        return prev
          .replace(itemPattern, "")
          .replace(/^,\s*/, "")
          .replace(/,\s*$/, "")
          .trim();
      });
    } else {
      // Add item to selection
      setSelectedItems((prev) => [...prev, item]);

      // Add to custom input
      setCustomInput((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed}, ${item}` : item;
      });
    }
  };

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);

    // Check if any selected items are no longer in the input
    const inputLower = value.toLowerCase();
    const itemsToRemove = selectedItems.filter(
      (item) => !inputLower.includes(item.toLowerCase())
    );

    if (itemsToRemove.length > 0) {
      setSelectedItems((prev) =>
        prev.filter((item) => !itemsToRemove.includes(item))
      );
    }
  };

  const handleNextStep = () => {
    if (currentStep === "items") {
      if (selectedItems.length === 0 && !customInput.trim()) {
        alert(
          "Please select at least one item or add custom items to continue."
        );
        return;
      }
      setCurrentStep("details");
    } else if (currentStep === "details") {
      // Use the current detailsItems (which have been updated by user input)
      // If detailsItems is empty, fall back to getAllItemsForDetails()
      const itemsToUse =
        detailsItems.length > 0
          ? detailsItems
          : getAllItemsForDetails().map((item, index) => ({
              id: `${item.name}-${index}`,
              name: item.name,
              quantity: item.quantity || "",
              notes: item.notes || "",
            }));

      setShoppingList(itemsToUse);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      setCurrentStep("location");
    } else if (currentStep === "location") {
      // Log the final payload before sending
      const finalPayload = createPayload();
      console.log("Sending payload to server:", finalPayload);

      setCurrentStep("loading");
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep("plan");
      }, 3000);
    }
  };

  const handleBackStep = () => {
    if (currentStep === "details") {
      setCurrentStep("items");
    } else if (currentStep === "confirm") {
      // Sync shoppingList back to detailsItems when going back to Step 2
      setDetailsItems(shoppingList);
      setCurrentStep("details");
    } else if (currentStep === "location") {
      setCurrentStep("confirm");
    }
  };

  // Parse custom input into items with quantities and notes
  const parseCustomInput = (
    input: string
  ): Array<{ name: string; quantity?: string; notes?: string }> => {
    if (!input.trim()) return [];

    const items = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    return items.map((item) => {
      // Try to extract quantity and notes from the item
      // Look for patterns like "2L milk", "1kg chicken (organic)", "organic bananas"

      // First check for quantity + name + notes pattern: "1kg Chicken (organic)"
      const quantityWithNotesMatch = item.match(
        /^(\d+(?:\.\d+)?\s*(?:kg|l|ml|g|lb|oz|pack|dozen|doz)?)\s+(.+?)\s*\(([^)]+)\)$/i
      );
      if (quantityWithNotesMatch) {
        return {
          name: quantityWithNotesMatch[2].trim(),
          quantity: quantityWithNotesMatch[1],
          notes: quantityWithNotesMatch[3].trim(),
        };
      }

      // Then check for quantity + name pattern: "2L milk", "1kg chicken"
      const quantityMatch = item.match(
        /^(\d+(?:\.\d+)?\s*(?:kg|l|ml|g|lb|oz|pack|dozen|doz)?)\s+(.+)$/i
      );
      if (quantityMatch) {
        return {
          name: quantityMatch[2],
          quantity: quantityMatch[1],
          notes: "",
        };
      }

      // Look for notes patterns in parentheses like "(organic)", "(free-range)"
      const notesMatch = item.match(/^(.+?)\s*\(([^)]+)\)$/i);
      if (notesMatch) {
        return {
          name: notesMatch[1].trim(),
          quantity: "",
          notes: notesMatch[2].trim(),
        };
      }

      // Look for notes patterns like "organic", "free-range", "wholemeal" (fallback)
      const notesMatchFallback = item.match(
        /^(.+?)\s+(organic|free-range|wholemeal|fresh|frozen|dried|low-fat|full-cream|skim|unsalted|salted|extra-virgin|pure|natural|sugar-free|diet|light|regular|large|small|medium|jumbo|premium|budget|store-brand|brand-name)$/i
      );
      if (notesMatchFallback) {
        return {
          name: notesMatchFallback[1],
          quantity: "",
          notes: notesMatchFallback[2],
        };
      }

      // Default: just the item name
      return {
        name: item,
        quantity: "",
        notes: "",
      };
    });
  };

  // Get all items for the details step - use shoppingList if available, otherwise parse input
  const getAllItemsForDetails = () => {
    // If we have a shoppingList (from Step 3), use that
    if (shoppingList.length > 0) {
      return shoppingList.map((item) => ({
        name: item.name,
        quantity: item.quantity || "",
        notes: item.notes || "",
      }));
    }

    // Otherwise, parse the custom input
    const customItemsList = parseCustomInput(customInput);

    // If no custom input, fall back to selected items
    if (customItemsList.length === 0) {
      return selectedItems.map((item) => ({
        name: item,
        quantity: "",
        notes: "",
      }));
    }

    return customItemsList;
  };

  // Initialize detailsItems when entering details step
  useEffect(() => {
    if (currentStep === "details" && detailsItems.length === 0) {
      // Use shoppingList if available, otherwise parse from input
      let itemsToUse;

      if (shoppingList.length > 0) {
        itemsToUse = shoppingList.map((item) => ({
          name: item.name,
          quantity: item.quantity || "",
          notes: item.notes || "",
        }));
      } else {
        const customItemsList = parseCustomInput(customInput);
        itemsToUse =
          customItemsList.length === 0
            ? selectedItems.map((item) => ({
                name: item,
                quantity: "",
                notes: "",
              }))
            : customItemsList;
      }

      const initialItems = itemsToUse.map((item, index) => ({
        id: `${item.name}-${index}`,
        name: item.name,
        quantity: item.quantity || "",
        notes: item.notes || "",
      }));
      setDetailsItems(initialItems);
    }
  }, [
    currentStep,
    customInput,
    selectedItems,
    detailsItems.length,
    shoppingList,
  ]);

  const updateItem = (id: string, updates: Partial<ShoppingListItem>) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setDetailsItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Update details item by name (for Step 2)
  const updateDetailsItemByName = (
    name: string,
    updates: Partial<ShoppingListItem>
  ) => {
    setDetailsItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
    setDetailsItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Create JSON payload for the backend
  const createPayload = () => {
    const payload = {
      shopping_list: shoppingList
        .map((item) =>
          [item.name, item.quantity, item.notes].filter(Boolean).join(" ")
        )
        .join(", "),
      location: useCurrentLocation
        ? currentLocation
          ? `${currentLocation.lat},${currentLocation.lng}`
          : "current_location"
        : location.trim() || "Sydney CBD",
      location_type: useCurrentLocation ? "coordinates" : "text",
      timestamp: new Date().toISOString(),
      source: "web_form",
    };

    console.log("Final payload to send to server:", payload);
    return payload;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    } else {
      alert(
        "Geolocation is not supported by this browser. Please enter your location manually."
      );
    }
  };

  // Handle location option change
  const handleLocationOptionChange = (useCurrent: boolean) => {
    setUseCurrentLocation(useCurrent);
    if (useCurrent && !currentLocation) {
      getCurrentLocation();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "items":
        return (
          <StepContainer>
            <StepHeader
              title="What do you need to buy?"
              description="Select common items or add your own"
            />

            <ItemSelectionGrid
              items={commonItems}
              selectedItems={selectedItems}
              onToggleItem={toggleItem}
              label="Quick Select Common Items"
            />

            {/* Selected Items Count */}
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-orange-100 rounded-lg p-3 text-center"
              >
                <span className="text-orange-700 font-medium">
                  {selectedItems.length} item
                  {selectedItems.length !== 1 ? "s" : ""} selected
                </span>
              </motion.div>
            )}

            <CustomInputToggle
              showDetails={showDetails}
              onToggle={setShowDetails}
              customInput={customInput}
              onInputChange={handleCustomInputChange}
            />

            <NavigationButtons
              onNext={handleNextStep}
              nextText="Continue"
              nextDisabled={selectedItems.length === 0}
              showBack={false}
            />
          </StepContainer>
        );

      case "details":
        return (
          <StepContainer>
            <StepHeader
              title="Add Details"
              description="Specify quantities and any special requirements"
            />

            <ItemDetailsForm
              items={getAllItemsForDetails()}
              detailsItems={detailsItems}
              onUpdateItem={updateDetailsItemByName}
            />

            <NavigationButtons
              onBack={handleBackStep}
              onNext={handleNextStep}
              backText="Back"
              nextText="Review List"
            />
          </StepContainer>
        );

      case "confirm":
        return (
          <StepContainer>
            <StepHeader
              title="Review Your List"
              description="Make sure everything looks correct"
            />

            <ShoppingListTable
              items={shoppingList}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddItem={() => {
                const newItem = {
                  id: `custom-${Date.now()}`,
                  name: "",
                  quantity: "",
                  notes: "",
                };
                setShoppingList((prev) => [...prev, newItem]);
                setDetailsItems((prev) => [...prev, newItem]);
              }}
            />

            <NavigationButtons
              onBack={handleBackStep}
              onNext={handleNextStep}
              backText="Back"
              nextText="Set Location"
              nextDisabled={shoppingList.length === 0}
            />
          </StepContainer>
        );

      case "location":
        return (
          <StepContainer>
            <StepHeader
              title="Your Location"
              description="Help us find the best stores near you"
            />

            <LocationSelector
              useCurrentLocation={useCurrentLocation}
              onLocationOptionChange={handleLocationOptionChange}
              currentLocation={currentLocation}
              manualLocation={location}
              onManualLocationChange={setLocation}
            />

            <NavigationButtons
              onBack={handleBackStep}
              onNext={handleNextStep}
              backText="Back"
              nextText="Generate Plan"
            />
          </StepContainer>
        );

      case "loading":
        return (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingAnimation />
          </motion.div>
        );

      case "plan":
        return (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PlanLayout planData={null} isLoading={false} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl"
      >
        <CardContainer variant="desktop" maxWidth="full">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </CardContainer>
      </motion.div>
    </div>
  );
}

export default ShoppingListForm;
