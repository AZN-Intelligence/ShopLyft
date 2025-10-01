interface SupermarketIconProps {
  retailerId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function SupermarketIcon({
  retailerId,
  size = "md",
  className = "",
}: SupermarketIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const getRetailerIcon = () => {
    const baseClasses = `${sizeClasses[size]} rounded-lg flex items-center justify-center shadow-md ${className}`;

    switch (retailerId.toLowerCase()) {
      case "woolworths":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-green-500 to-green-600`}
          >
            <img
              src="/src/assets/woolworth.png"
              alt="Woolworths"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "coles":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-red-500 to-red-600`}
          >
            <img
              src="/src/assets/coles.png"
              alt="Coles"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "aldi":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-blue-500 to-blue-600`}
          >
            <img
              src="/src/assets/aldi.png"
              alt="ALDI"
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "iga":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-purple-500 to-purple-600`}
          >
            <span className="text-white text-lg font-bold">I</span>
          </div>
        );
      case "foodland":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-yellow-500 to-yellow-600`}
          >
            <span className="text-white text-lg font-bold">F</span>
          </div>
        );
      default:
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-gray-500 to-gray-600`}
          >
            <span className="text-white text-lg font-bold">?</span>
          </div>
        );
    }
  };

  return getRetailerIcon();
}

export default SupermarketIcon;
