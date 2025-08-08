import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/Popover';
import { Calendar } from './ui/Calendar';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  name?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onSelect,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  className = "",
  disabled = false,
  error = false,
  id,
  name
}) => {
  const [open, setOpen] = useState(false);

  // Memoize the selected date to prevent unnecessary re-renders
  const selectedDate = useMemo(() => {
    if (!selected) return undefined;
    
    // Handle both Date objects and date strings
    if (selected instanceof Date) {
      return isValid(selected) ? selected : undefined;
    }
    
    // Handle string dates
    if (typeof selected === 'string') {
      try {
        const parsed = parseISO(selected);
        return isValid(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    
    return undefined;
  }, [selected]);

  const handleSelect = useCallback((date: Date) => {
    if (!isValid(date)) {
      console.warn('Invalid date selected:', date);
      return;
    }

    // Create a clean date object at midnight local time
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Validate against min/max dates
    if (minDate && cleanDate < minDate) {
      console.warn('Selected date is before minimum date');
      return;
    }
    
    if (maxDate && cleanDate > maxDate) {
      console.warn('Selected date is after maximum date');
      return;
    }

    onSelect(cleanDate);
    setOpen(false);
  }, [onSelect, minDate, maxDate]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setOpen(prev => !prev);
    }
  }, [disabled]);

  // Close calendar when scrolling outside
  useEffect(() => {
    const handleScroll = () => {
      if (open) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const displayText = useMemo(() => {
    if (selectedDate) {
      try {
        return format(selectedDate, 'PPP'); // e.g., "January 1, 2024"
      } catch {
        return placeholder;
      }
    }
    return placeholder;
  }, [selectedDate, placeholder]);

  const buttonClasses = useMemo(() => {
    const baseClasses = `
      w-full px-4 py-3 border rounded-lg 
      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
      transition-all text-left flex items-center space-x-3
      ${!selectedDate ? 'text-gray-500' : 'text-gray-900'}
      ${disabled 
        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' 
        : error
          ? 'border-red-300 hover:border-red-400 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400 bg-white'
      }
      ${className}
    `;
    return baseClasses.replace(/\s+/g, ' ').trim();
  }, [selectedDate, disabled, error, className]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={handleToggle} asChild>
        <button
          type="button"
          className={buttonClasses}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={selectedDate ? `Selected date: ${displayText}` : placeholder}
          id={id}
          name={name}
        >
          <CalendarIcon className={`h-5 w-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
          <span className="flex-1 truncate">
            {displayText}
          </span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        open={open} 
        align="start"
        className="w-auto p-0"
        sideOffset={4}
      >
        <Calendar
          selected={selectedDate}
          onSelect={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
          className="border-0"
        />
      </PopoverContent>
    </Popover>
  );
};