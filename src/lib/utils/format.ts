import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date for display in the UI
 * @param date Date to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatStr: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date as a relative time (e.g. "5 minutes ago")
 * @param date Date to format
 * @param addSuffix Whether to add a suffix
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number, addSuffix: boolean = true): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return formatDistanceToNow(dateObj, { addSuffix });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format a number with specific options
 * @param num Number to format
 * @param options Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  num: number, 
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat('en-US', options).format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
