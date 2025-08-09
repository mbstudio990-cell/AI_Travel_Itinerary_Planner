import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProviderProps {
  delay?: number;
  closeDelay?: number;
  children: React.ReactNode;
}

export interface TooltipContentProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  arrow?: boolean;
  children: React.ReactNode;
}

export interface TooltipTriggerProps {
  render: React.ReactElement;
}

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  delay: number;
  closeDelay: number;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  delay = 700,
  closeDelay = 300,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen, delay, closeDelay }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip: React.FC<{ defaultOpen?: boolean; children: React.ReactNode }> = ({
  defaultOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  return (
    <TooltipContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      delay: 700, 
      closeDelay: 300 
    }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ render }) => {
  const context = React.useContext(TooltipContext);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  if (!context) {
    throw new Error('TooltipTrigger must be used within a Tooltip');
  }

  const { isOpen, setIsOpen, delay, closeDelay } = context;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return React.cloneElement(render, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    'aria-describedby': isOpen ? 'tooltip' : undefined,
  });
};

export const TooltipContent: React.FC<TooltipContentProps> = ({
  side = 'top',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  arrow = true,
  children
}) => {
  const context = React.useContext(TooltipContext);

  if (!context) {
    throw new Error('TooltipContent must be used within a Tooltip');
  }

  const { isOpen } = context;

  const getPositionClasses = () => {
    const positions = {
      top: `bottom-full mb-${sideOffset}`,
      bottom: `top-full mt-${sideOffset}`,
      left: `right-full mr-${sideOffset}`,
      right: `left-full ml-${sideOffset}`
    };

    const alignments = {
      start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
      center: side === 'top' || side === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2',
      end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0'
    };

    return `${positions[side]} ${alignments[align]}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            ${getPositionClasses()}
          `}
          id="tooltip"
          role="tooltip"
          style={{
            [side === 'top' || side === 'bottom' ? 'marginLeft' : 'marginTop']: alignOffset
          }}
        >
          {children}
          {arrow && (
            <div
              className={`
                absolute w-2 h-2 bg-gray-900 transform rotate-45
                ${side === 'top' ? 'bottom-0 translate-y-1/2' : ''}
                ${side === 'bottom' ? 'top-0 -translate-y-1/2' : ''}
                ${side === 'left' ? 'right-0 translate-x-1/2' : ''}
                ${side === 'right' ? 'left-0 -translate-x-1/2' : ''}
                ${align === 'center' ? 'left-1/2 -translate-x-1/2' : ''}
                ${align === 'start' && (side === 'top' || side === 'bottom') ? 'left-3' : ''}
                ${align === 'end' && (side === 'top' || side === 'bottom') ? 'right-3' : ''}
                ${align === 'start' && (side === 'left' || side === 'right') ? 'top-3' : ''}
                ${align === 'end' && (side === 'left' || side === 'right') ? 'bottom-3' : ''}
              `}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};