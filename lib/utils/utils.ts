import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a number to readable format with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Number(num.toFixed(2)));
}

// Format a number as USD
export function formatUSD(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(num.toFixed(2)));
}
export function formatUSDString(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(num.toFixed(2)));
}

// Format numbers with B, M, K suffixes or as USD for small values
export function formatWithSuffix(num: number): string {
  if (num < 1000) {
    return formatUSD(num);
  }
  
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;
  
  if (num >= billion) {
    return `$${(num / billion).toFixed(2)}B`;
  } else if (num >= million) {
    return `$${(num / million).toFixed(2)}M`;
  } else {
    return `$${(num / thousand).toFixed(2)}k`;
  }
}