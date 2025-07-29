import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast as _toast, ToasterProps } from "sonner";
import { formatDate as _formatDate } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TODO: Share sonner toast package with core.
const defaultToastOptions = {
  position: "top-right" as ToasterProps["position"],
  richColors: true,
};

export const toast = {
  error: (message: string, options = {}) =>
    _toast.error(message, { ...defaultToastOptions, ...options }),
  warning: (message: string, options = {}) =>
    _toast.warning(message, { ...defaultToastOptions, ...options }),
  success: (message: string, options = {}) =>
    _toast.success(message, { ...defaultToastOptions, ...options }),
  info: (message: string, options = {}) =>
    _toast.info(message, { ...defaultToastOptions, ...options }),
};

export const formatCurrency = (value?: number) => {
  if (value === undefined) {
    return "NA";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};

export const formatDate = (date?: string) => {
  if (!date) {
    return "NA";
  }

  return _formatDate(date, "dd MMM yyyy");
};

export const calculateAge = (dateOfBirth?: string, yearOfBirth?: number) => {
  if (!dateOfBirth && !yearOfBirth) {
    return "NA";
  }

  const year = yearOfBirth ? yearOfBirth : new Date(dateOfBirth!).getFullYear();
  const age = new Date().getFullYear() - year;

  return `${age} Y`;
};