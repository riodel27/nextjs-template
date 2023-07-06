import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidJSON(errorMessage: string) {
  try {
    return JSON.parse(errorMessage);
  } catch (_error) {
    return errorMessage;
  }
}
