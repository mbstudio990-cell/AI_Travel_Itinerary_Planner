import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isAfter,
  isBefore,
  startOfDay,
  isToday
} from 'date-fns';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  selected, 
  onSelect, 
  minDate,
  maxDate,
  className = '' 
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    // Initialize with selected date or today
    return selected || new Date();
  });

  // Update current month when selected date changes (for external updates)
  React.useEffect(() => {
    if (selected && !isSameMonth(selected, currentMonth)) {
      setCurrentMonth(selected);
    }
  }, [selected, currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const isDateDisabled = React.useCallback((date: Date) => {
    const dayStart = startOfDay(date);
    
    if (minDate && isBefore(dayStart, startOfDay(minDate))) {
      return true;
    }
    if (maxDate && isAfter(dayStart, startOfDay(maxDate))) {
      return true;
    }
    return false;
  }, [minDate, maxDate]);

  const handleDateClick = React.useCallback((date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || isDateDisabled(date)) {
      return;
    }

    // Create a clean date object at midnight local time
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    onSelect(cleanDate);
  }, [onSelect, isDateDisabled]);

  const prevMonth = React.useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const nextMonth = React.useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  // Generate calendar grid
  const calendarDays = React.useMemo(() => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = new Date(day);
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isSelected = selected && isSameDay(currentDay, selected);
      const isDisabled = isDateDisabled(currentDay);
      const isTodayDate = isToday(currentDay);

      days.push({
        date: currentDay,
        day: format(currentDay, 'd'),
        isCurrentMonth,
        isSelected,
        isDisabled,
        isToday: isTodayDate
      });

      day = addDays(day, 1);
    }

    return days;
  }, [startDate, endDate, monthStart, selected, isDateDisabled]);

  // Group days into weeks
  const weeks = React.useMemo(() => {
    const weekRows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weekRows.push(calendarDays.slice(i, i + 7));
    }
    return weekRows;
  }, [calendarDays]);

  const canGoPrevious = React.useMemo(() => {
    if (!minDate) return true;
    const prevMonthDate = subMonths(currentMonth, 1);
    return !isBefore(endOfMonth(prevMonthDate), startOfDay(minDate));
  }, [currentMonth, minDate]);

  const canGoNext = React.useMemo(() => {
    if (!maxDate) return true;
    const nextMonthDate = addMonths(currentMonth, 1);
    return !isAfter(startOfMonth(nextMonthDate), startOfDay(maxDate));
  }, [currentMonth, maxDate]);

  return (
    <div className={`p-3 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrevious}
          className={`p-1 rounded-md transition-colors ${
            canGoPrevious 
              ? 'hover:bg-gray-100 text-gray-700' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-sm font-medium text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoNext}
          className={`p-1 rounded-md transition-colors ${
            canGoNext 
              ? 'hover:bg-gray-100 text-gray-700' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div 
            key={day} 
            className="w-9 h-9 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1" role="row">
            {week.map((dayInfo, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                onClick={() => handleDateClick(dayInfo.date, dayInfo.isCurrentMonth)}
                disabled={dayInfo.isDisabled}
                onMouseDown={(e) => e.preventDefault()}
                className={`
                  w-9 h-9 flex items-center justify-center text-sm rounded-md transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  ${!dayInfo.isCurrentMonth 
                    ? 'text-gray-300 hover:text-gray-400' 
                    : dayInfo.isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : dayInfo.isSelected
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : dayInfo.isToday
                          ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
                          : 'text-gray-900 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
                aria-label={format(dayInfo.date, 'EEEE, MMMM d, yyyy')}
                aria-selected={dayInfo.isSelected}
                aria-disabled={dayInfo.isDisabled}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};