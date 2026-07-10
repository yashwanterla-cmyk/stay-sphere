import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = true,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={`bg-background-soft border border-primary/5 rounded-xl p-6 shadow-soft hover:shadow-premium transition-shadow duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
