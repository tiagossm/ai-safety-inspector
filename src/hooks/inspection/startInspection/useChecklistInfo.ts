
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleError } from "@/utils/errorHandling";
import { ChecklistWithStats } from "@/types/newChecklist";

// Helper function to transform raw checklist data
const transformChecklistData = (data: any): Partial<ChecklistWithStats> => {
  if (!data) return {};
  
  return {
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    isTemplate: data.is_template || false,
    companyId: data.company_id || null,
    responsibleId: data.responsible_id || null
  };
};

export function useChecklistInfo(
  checklistId: string | undefined,
  updateCompanyId: (id: string) => void,
  updateResponsibleId: (id: string) => void,
  fetchCompanyDetails: (companyId: string) => void,
  fetchResponsibleDetails: (responsibleId: string) => void
) {
  const [checklist, setChecklist] = useState<Partial<ChecklistWithStats>>(null);
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
          responsible_id,
          is_template
        `)
        .eq("id", checklistId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Transform data to consistent format
        const transformedData = transformChecklistData(data);
        setChecklist(transformedData);
        
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
      handleError(err, "Não foi possível carregar os dados do checklist");
    } finally {
      setChecklistLoading(false);
    }
  }, [checklistId, updateCompanyId, updateResponsibleId, fetchCompanyDetails, fetchResponsibleDetails]);

  return { checklist, checklistLoading, fetchChecklistInfo, setChecklist };
}
