
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";

export function useChecklists() {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match ChecklistWithStats interface
      const transformedChecklists: ChecklistWithStats[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isTemplate: item.is_template,
        status: item.status,
        category: item.category,
        responsibleId: item.responsible_id,
        companyId: item.company_id,
        userId: item.user_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        dueDate: item.due_date,
        isSubChecklist: item.is_sub_checklist,
        origin: item.origin,
        totalQuestions: item.total_questions || 0,
        completedQuestions: 0, // Set default
        companyName: "", // Will be populated separately if needed
        responsibleName: "" // Will be populated separately if needed
      }));

      setChecklists(transformedChecklists);
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      setError(err.message);
      toast.error("Failed to load checklists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  return {
    checklists,
    loading,
    error,
    fetchChecklists
  };
}
