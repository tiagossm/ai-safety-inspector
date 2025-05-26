
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InspectionAuditLog {
  id: string;
  inspection_id: string;
  question_id?: string;
  user_id: string;
  action_type: string;
  changed_field?: string;
  previous_value?: any;
  new_value?: any;
  timestamp: string;
  access_source: string;
  metadata?: any;
  created_at: string;
}

export function useInspectionAuditLogs(inspectionId: string | undefined) {
  const [logs, setLogs] = useState<InspectionAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    if (!inspectionId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("inspection_audit_logs")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("timestamp", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar logs de auditoria:", err);
      setError(err.message || "Erro ao carregar logs de auditoria");
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const logAuditAction = useCallback(async (
    questionId: string | null,
    actionType: string,
    changedField?: string,
    previousValue?: any,
    newValue?: any,
    metadata?: any
  ) => {
    if (!inspectionId) return;

    try {
      const { error } = await supabase.rpc("log_inspection_audit", {
        p_inspection_id: inspectionId,
        p_question_id: questionId,
        p_action_type: actionType,
        p_changed_field: changedField,
        p_previous_value: previousValue,
        p_new_value: newValue,
        p_access_source: "web",
        p_metadata: metadata
      });

      if (error) {
        console.error("Erro ao registrar log de auditoria:", error);
      } else {
        // Atualizar logs após registrar novo
        fetchAuditLogs();
      }
    } catch (err: any) {
      console.error("Erro ao registrar log de auditoria:", err);
    }
  }, [inspectionId, fetchAuditLogs]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return {
    logs,
    loading,
    error,
    refreshLogs: fetchAuditLogs,
    logAuditAction
  };
}
