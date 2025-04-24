
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";

export async function fetchInspectionData(inspectionId) {
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
  } catch (err) {
    console.error("Erro em fetchInspectionData:", err);
    return {
      error: err.message || "Erro desconhecido",
      detailedError: err,
    };
  }
}
