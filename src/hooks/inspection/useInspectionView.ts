
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useInspectionView(inspectionId: string | undefined) {
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      navigate("/inspections");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchInspection = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("inspections")
          .select(`
            id, 
            status, 
            created_at, 
            updated_at, 
            company_id, 
            companies(id, fantasy_name, address, cnae), 
            checklist_id, 
            checklist, 
            responsible_id, 
            location,
            metadata,
            user_id, 
            users(id, name, email),
            cnae, 
            approval_status,
            priority,
            inspection_type,
            scheduled_date
          `)
          .eq("id", inspectionId)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError("Inspeção não encontrada");
          toast.error("Inspeção não encontrada");
          navigate("/inspections");
          return;
        }

        setInspection(data);
      } catch (error: any) {
        console.error("Erro ao buscar inspeção:", error);
        setError(error.message);
        toast.error(`Erro ao carregar inspeção: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInspection();
  }, [inspectionId, navigate]);

  return {
    inspection,
    loading,
    error
  };
}
