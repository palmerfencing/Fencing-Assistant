import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMillimetres(value: number, precision = 0) {
  return `${value.toFixed(precision)} mm`;
}
