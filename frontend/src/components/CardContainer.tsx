import { type ReactNode } from "react";

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  variant?: "default" | "mobile" | "desktop";
}

function CardContainer({
  children,
  className = "",
  maxWidth = "md",
  variant = "default",
}: CardContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const baseClasses =
    "mx-auto bg-gradient-to-br from-orange-50/95 to-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50";

  const variantClasses = {
    default: "p-6",
    mobile: "p-6",
    desktop: "p-8",
  };

  const opacityClasses = {
    default: "",
    mobile: "opacity-85",
    desktop: "",
  };

  return (
    <div
      className={`w-full ${maxWidthClasses[maxWidth]} ${baseClasses} ${variantClasses[variant]} ${opacityClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

export default CardContainer;
