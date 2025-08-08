import React from 'react';
import { motion } from 'framer-motion';

interface MotionHighlightProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export const MotionHighlight: React.FC<MotionHighlightProps> = ({ 
  children, 
  hover = false, 
  className = '' 
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover={hover ? {
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      } : undefined}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={hover ? {
          x: '100%',
          transition: { duration: 0.6, ease: "easeInOut" }
        } : undefined}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};