
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistInfo(
  checklistId: string | undefined,
  updateCompanyId: (id: string) => void,
  updateResponsibleId: (id: string) => void,
  fetchCompanyDetails: (companyId: string) => void,
  fetchResponsibleDetails: (responsibleId: string) => void
) {
  const [checklist, setChecklist] = useState<any>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const fetchChecklistInfo = useCallback(async () => {
    if (!checklistId) return;
    setChecklistLoading(true);
    try {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          id, 
          title, 
          description,
          company_id,
          responsible_id
        `)
        .eq("id", checklistId)
        .single();
      if (error) throw error;
      if (data) {
        setChecklist(data);
        if (data.company_id) {
          updateCompanyId(data.company_id);
          fetchCompanyDetails(data.company_id);
        }
        if (data.responsible_id) {
          updateResponsibleId(data.responsible_id);
          fetchResponsibleDetails(data.responsible_id);
        }
      }
    } catch (err) {
      console.error("Error fetching checklist:", err);
      toast.error("Não foi possível carregar os dados do checklist");
    } finally {
      setChecklistLoading(false);
    }
  }, [checklistId, updateCompanyId, updateResponsibleId, fetchCompanyDetails, fetchResponsibleDetails]);

  return { checklist, checklistLoading, fetchChecklistInfo, setChecklist };
}
