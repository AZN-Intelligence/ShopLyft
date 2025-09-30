import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardContainer from "../CardContainer";

// Sample grocery items - in a real app, this would come from an API
const availableItems = [
  "Milk",
  "Eggs",
  "Bread",
  "Butter",
  "Cheese",
  "Yogurt",
  "Chicken",
  "Beef",
  "Fish",
  "Rice",
  "Pasta",
  "Tomatoes",
  "Onions",
  "Carrots",
  "Potatoes",
  "Apples",
  "Bananas",
  "Oranges",
  "Spinach",
  "Lettuce",
  "Cucumber",
  "Olive Oil",
  "Salt",
  "Pepper",
  "Garlic",
  "Ginger",
  "Lemon",
  "Lime",
  "Cereal",
  "Oats",
  "Nuts",
  "Coffee",
  "Tea",
  "Sugar",
  "Flour",
  "Honey",
];

function ShoppingListForm() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = availableItems.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item for your shopping list.");
      return;
    }
    console.log("Selected items:", selectedItems);
    // Here you would typically send the data to your backend
    alert(`Shopping list created with ${selectedItems.length} items!`);
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-orange-600">
                Create Your Shopping List
              </h2>
              <p className="text-orange-700">
                Search and select items you need to buy
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for items..."
                className="w-full border border-orange-300 rounded-lg p-4 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400">
                🔍
              </div>
            </div>

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

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem(item)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                        ${
                          isSelected
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                            : "bg-white border-orange-200 text-orange-700 hover:border-orange-300 hover:bg-orange-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isSelected && <span>✓</span>}
                        <span className="truncate">{item}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredItems.length === 0 && searchTerm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-orange-600"
              >
                <p>No items found for "{searchTerm}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <motion.button
                onClick={handleSubmit}
                disabled={selectedItems.length === 0}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200
                  ${
                    selectedItems.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-xl"
                  }
                `}
              >
                Create Shopping List ({selectedItems.length})
              </motion.button>
            </div>
          </div>
        </CardContainer>
      </motion.div>
    </div>
  );
}

export default ShoppingListForm;
