import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string;
  size?: string;
  notes?: string;
}

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  onUpdateItem: (id: string, updates: Partial<ShoppingListItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: () => void;
}

function ShoppingListTable({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
}: ShoppingListTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalItem, setOriginalItem] = useState<ShoppingListItem | null>(
    null
  );

  const handleAddItem = () => {
    onAddItem();
  };

  // Auto-edit newly added items (empty name)
  useEffect(() => {
    const newItem = items.find((item) => item.name === "");
    if (newItem && editingId !== newItem.id) {
      setEditingId(newItem.id);
    }
  }, [items, editingId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-orange-200 overflow-hidden"
    >
      <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
        <h3 className="text-lg font-semibold text-orange-800">
          Your Shopping List
        </h3>
        <p className="text-sm text-orange-600">
          Review and edit your items before generating your plan
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-orange-600">
            <p>No items in your shopping list yet.</p>
            <button
              onClick={handleAddItem}
              className="mt-2 text-orange-500 hover:text-orange-600 font-medium"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.025 }}
                className="p-4 hover:bg-orange-25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            onUpdateItem(item.id, { name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Item name"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              onUpdateItem(item.id, {
                                quantity: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Quantity (e.g., 2L, 1kg)"
                          />
                          <input
                            type="text"
                            value={item.notes || ""}
                            onChange={(e) =>
                              onUpdateItem(item.id, { notes: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Notes (e.g., organic, free-range)"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setOriginalItem(null);
                            }}
                            className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              // If item has no name, remove it when canceling
                              if (!item.name.trim()) {
                                onRemoveItem(item.id);
                              } else if (originalItem) {
                                // Revert to original values
                                onUpdateItem(item.id, {
                                  name: originalItem.name,
                                  quantity: originalItem.quantity,
                                  notes: originalItem.notes,
                                });
                              }
                              setEditingId(null);
                              setOriginalItem(null);
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-orange-800">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-orange-600 mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId !== item.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setOriginalItem({ ...item });
                          setEditingId(item.id);
                        }}
                        className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-orange-200 bg-orange-25">
          <button
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-orange-300 text-orange-600 rounded-md hover:border-orange-400 hover:text-orange-700 transition-colors"
          >
            + Add another item
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default ShoppingListTable;
