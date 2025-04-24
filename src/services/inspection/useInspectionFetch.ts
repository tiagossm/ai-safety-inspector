// src/services/inspection/inspectionFetchService.ts

import { supabase } from "@/lib/supabaseClient";

// Versão leve apenas para testes no Lovable
export async function fetchInspectionData(inspectionId: string) {
  try {
    // Busca dados básicos do checklist
    const { data: checklist, error } = await supabase
      .from("checklists")
      .select("id, title, description")
      .eq("id", inspectionId)
      .single();

    if (error) {
      throw error;
    }

    return {
      inspection: checklist,
      questions: [],
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
