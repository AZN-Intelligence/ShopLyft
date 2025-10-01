import { motion } from "framer-motion";

interface AddToCartButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  links: string[];
}

const AddToCartButton = ({
  onClick,
  disabled = false,
  size = "sm",
  links,
}: AddToCartButtonProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-3 py-1.5 text-xs";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={() => {
        console.log('[ShopLyft] AddToCartButton clicked');
        if (onClick) onClick();
        console.log('[ShopLyft] Dispatching shoplyft-add-to-cart event with links:', links);
        window.dispatchEvent(
          new CustomEvent('shoplyft-add-to-cart', {
            detail: { links }
          })
        );
      }}
      disabled={disabled}
      className={`
        bg-orange-500 text-white rounded-lg font-medium 
        hover:bg-orange-600 transition-colors shadow-md
        disabled:bg-gray-400 disabled:cursor-not-allowed
        ${getSizeClasses()}
      `}
      data-shoplyft-add-to-cart
    >
      Add to Cart
    </motion.button>
  );
};

export default AddToCartButton;
