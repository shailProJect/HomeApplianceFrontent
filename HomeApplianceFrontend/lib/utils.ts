import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const handleApiError = (error: any): string => {
  if (error.response) {
    return (
      error.response.data?.message ||
      "Something went wrong"
    );
  }

  if (error.request) {
    return "Server is not responding. Please try again.";
  }

  return error.message || "Unexpected error occurred";
};