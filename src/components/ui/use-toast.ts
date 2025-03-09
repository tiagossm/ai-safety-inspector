
import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { toast as originalToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from 'sonner';

export const useToast = useToastOriginal;

// Exporta uma função toast ampliada que também usa o Sonner para mensagens mais visíveis
export const toast = {
  ...originalToast,
  success: (message: string, options?: any) => {
    sonnerToast.success(message, options);
    return originalToast({
      title: message,
      variant: "default",
      ...options
    });
  },
  error: (message: string, options?: any) => {
    sonnerToast.error(message, options);
    return originalToast({
      title: message,
      variant: "destructive",
      ...options
    });
  },
  info: (message: string, options?: any) => {
    sonnerToast.info(message, options);
    return originalToast({
      title: message,
      variant: "default",
      ...options
    });
  }
};
