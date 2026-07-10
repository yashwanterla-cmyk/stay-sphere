import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle =
    "px-4 py-2.5 font-medium rounded-xl flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-primary-light/20 text-primary-dark hover:bg-primary-light/35",
    outline: "border border-primary/25 text-primary-dark hover:bg-background-soft",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-text-light hover:bg-background-soft",
  };

  return (
    <motion.button
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props as any}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-current mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};
export default Button;
