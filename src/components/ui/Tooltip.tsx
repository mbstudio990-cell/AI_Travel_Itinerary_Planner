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

export interface TooltipProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  delay: number;
  closeDelay: number;
}>({
  delay: 700,
  closeDelay: 300,
});

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  delay = 700,
  closeDelay = 300,
  children,
}) => {
  return (
    <TooltipContext.Provider value={{ delay, closeDelay }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({ defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [triggerElement, setTriggerElement] = useState<React.ReactElement | null>(null);
  const [contentElement, setContentElement] = useState<React.ReactElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const { delay, closeDelay } = React.useContext(TooltipContext);

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

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(child => 
    React.isValidElement(child) && child.type === TooltipTrigger
  ) as React.ReactElement;
  const content = childrenArray.find(child => 
    React.isValidElement(child) && child.type === TooltipContent
  ) as React.ReactElement;

  return (
    <div className="relative inline-block">
      {trigger && React.cloneElement(trigger, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        isOpen,
      })}
      {content && isOpen && React.cloneElement(content, { isOpen })}
    </div>
  );
};

export const TooltipTrigger: React.FC<{
  render?: React.ReactElement;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isOpen?: boolean;
  children?: React.ReactNode;
}> = ({ render, onMouseEnter, onMouseLeave, children }) => {
  if (render) {
    return React.cloneElement(render, {
      onMouseEnter,
      onMouseLeave,
    });
  }

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps & { isOpen?: boolean }> = ({
  side = 'top',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  arrow = true,
  children,
  isOpen,
}) => {
  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2',
      right: 'left-full ml-2',
    };

    const alignments = {
      start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
      center: side === 'top' || side === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2',
      end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
    };

    return `${positions[side]} ${alignments[align]}`;
  };

  const getArrowClasses = () => {
    if (!arrow) return '';
    
    const arrowPositions = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
    };

    return arrowPositions[side];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute z-50 ${getPositionClasses()}`}
          style={{
            marginTop: side === 'bottom' ? sideOffset : undefined,
            marginBottom: side === 'top' ? sideOffset : undefined,
            marginLeft: side === 'right' ? sideOffset : undefined,
            marginRight: side === 'left' ? sideOffset : undefined,
          }}
        >
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs relative">
            {children}
            {arrow && (
              <div
                className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};