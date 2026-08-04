import { format, parseISO, isValid } from 'date-fns';

/**
 * Global Date Formatter
 * Used to format dates across the application to ensure consistency.
 * 
 * @param date - The date string, timestamp, or Date object to format
 * @param formatStr - The desired output format (default is 'dd/MM/yyyy')
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDate = (date: any, formatStr: string = 'dd/MM/yyyy') => {
  if (!date) return 'N/A';

  try {
    let parsedDate: Date;

    if (typeof date === 'string') {
      // If it's a valid ISO string, parse it
      parsedDate = parseISO(date);
      // Fallback for non-ISO string formats
      if (!isValid(parsedDate)) {
        parsedDate = new Date(date);
      }
    } else {
      parsedDate = new Date(date);
    }

    if (isValid(parsedDate)) {
      return format(parsedDate, formatStr);
    }
    
    return 'N/A';
  } catch (error) {
    return 'N/A';
  }
};
