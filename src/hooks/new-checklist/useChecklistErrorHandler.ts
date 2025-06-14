
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleError } from "@/utils/errorHandling";

export function useChecklistErrorHandler(error: unknown, redirectPath: string) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao carregar checklist");
      navigate(redirectPath);
    }
  }, [error, navigate, redirectPath]);
}
