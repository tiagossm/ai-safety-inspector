// src/services/inspection/inspectionFetchService.ts

import { supabase } from "@/integrations/supabase/client";

export async function fetchInspectionData(inspectionId: string) {
  try {
    const { data, error } = await supabase
      .from("checklists")
      .select("id, title, description")
      .eq("id", inspectionId)
      .single();

    if (error) throw error;

    return {
      inspection: data,
      questions: [], // ← evita sobrecarga
      groups: [],
      responses: {},
      company: null,
      responsible: null,
      subChecklists: {},
    };
  } catch (err: any) {
    console.error("Erro em fetchInspectionData:", err);
    return {
      error: err.message || "Erro desconhecido",
      detailedError: err,
    };
  }
}
