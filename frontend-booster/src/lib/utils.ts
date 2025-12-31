import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para exibição
 * Aceita Date ou string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy HH:mm",
): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch {
    return typeof date === "string" ? date : date.toLocaleString();
  }
}
