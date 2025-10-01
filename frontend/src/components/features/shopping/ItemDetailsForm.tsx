import { motion } from "framer-motion";
import { type ShoppingListItem } from "../../types";

interface ItemDetailsFormProps {
  items: Array<{ name: string; quantity?: string; notes?: string }>;
  detailsItems: ShoppingListItem[];
  onUpdateItem: (name: string, updates: Partial<ShoppingListItem>) => void;
}

export default function ItemDetailsForm({
  items,
  detailsItems,
  onUpdateItem,
}: ItemDetailsFormProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        // Find the corresponding details item or create a new one
        const detailsItem = detailsItems.find((d) => d.name === item.name) || {
          id: `${item.name}-${index}`,
          name: item.name,
          quantity: item.quantity || "",
          notes: item.notes || "",
        };

        return (
          <motion.div
            key={`${item.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-orange-50 rounded-lg p-4"
          >
            <div className="mb-3">
              <span className="font-medium text-orange-800">{item.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Quantity (e.g., 2L, 1kg)"
                value={detailsItem.quantity}
                onChange={(e) => {
                  onUpdateItem(item.name, {
                    quantity: e.target.value,
                  });
                }}
                className="px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <input
                type="text"
                placeholder="Notes (e.g., organic, free-range)"
                value={detailsItem.notes}
                onChange={(e) => {
                  onUpdateItem(item.name, {
                    notes: e.target.value,
                  });
                }}
                className="px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
