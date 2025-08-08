import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopoverProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({ children, open, onOpenChange }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, handleClickOutside, handleEscapeKey]);

  return (
    <div className="relative" ref={popoverRef}>
      {children}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  asChild?: boolean;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children, 
  onClick, 
  asChild = false 
}) => {
  if (asChild) {
    // Clone the child element and add onClick
    return React.cloneElement(children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onClick();
        // Call original onClick if it exists
        const originalOnClick = (children as React.ReactElement).props.onClick;
        if (originalOnClick) {
          originalOnClick(e);
        }
      }
    });
  }

  return (
    <div onClick={onClick} className="inline-block">
      {children}
    </div>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  open: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  open, 
  align = 'start',
  side = 'bottom',
  sideOffset = 8,
  className = ''
}) => {
  const getAlignmentClass = () => {
    switch (align) {
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'end':
        return 'right-0';
      default:
        return 'left-0';
    }
  };

  const getSideClass = () => {
    switch (side) {
      case 'top':
        return `bottom-full mb-${sideOffset}`;
      case 'left':
        return `right-full mr-${sideOffset}`;
      case 'right':
        return `left-full ml-${sideOffset}`;
      default:
        return `top-full mt-${sideOffset}`;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.4, 0, 0.2, 1] // Custom easing for smooth animation
          }}
          className={`
            absolute z-50 ${getSideClass()} ${getAlignmentClass()}
          `}
          style={{ 
            transformOrigin: side === 'bottom' ? 'top' : 'bottom'
          }}
        >
          <div className={`
            bg-white border border-gray-200 rounded-lg shadow-lg p-0 min-w-max
            ${className}
          `}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};