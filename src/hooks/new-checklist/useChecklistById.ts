import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup, ChecklistWithQuestions } from "@/types/checklist";
import { mapResponseType } from "@/utils/typeMapping";
import { handleApiError } from "@/utils/errorHandling";

/**
 * Hook para buscar um checklist pelo ID
 * @param checklistId ID do checklist a ser buscado
 */
export function useChecklistById(checklistId: string | undefined) {
  const [checklist, setChecklist] = useState<ChecklistWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca o checklist e suas perguntas
   */
  const fetchChecklist = async () => {
    if (!checklistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Busca os dados básicos do checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", checklistId)
        .single();

      if (checklistError) {
        throw new Error(`Erro ao buscar checklist: ${checklistError.message}`);
      }

      // Busca as perguntas do checklist
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("ordem", { ascending: true });

      if (questionsError) {
        throw new Error(`Erro ao buscar perguntas: ${questionsError.message}`);
      }

      // Mapeia as perguntas do banco de dados para o formato do frontend
      const questions: ChecklistQuestion[] = (questionsData || []).map((item, index) => {
        // Mapeia o tipo de resposta para o formato do frontend
        const responseType = mapResponseType(item.tipo_resposta || "texto", "toFrontend");
        
        // Prepara opções para múltipla escolha
        const options = Array.isArray(item.opcoes) 
          ? item.opcoes.map(opt => String(opt)) 
          : [];
          
        return {
          id: item.id,
          text: item.pergunta || "",
          responseType,
          isRequired: item.obrigatorio || false,
          order: item.ordem || index,
          options,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          allowsFiles: item.permite_files || false,
          weight: item.weight || 1,
          hint: item.hint || "",
          groupId: undefined, // O banco de dados não tem coluna group_id
          condition: undefined, // O banco de dados não tem coluna condition
          conditionValue: item.condition_value || undefined,
          parentQuestionId: item.parent_item_id || undefined,
          hasSubChecklist: item.has_subchecklist || false,
          subChecklistId: item.sub_checklist_id || undefined
        };
      });

      // Cria o objeto de checklist com as perguntas
      const mappedChecklist: ChecklistWithQuestions = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description || "",
        category: checklistData.category || "",
        isTemplate: checklistData.is_template || false,
        status: checklistData.status || "ativo",
        companyId: checklistData.company_id || undefined,
        responsibleId: checklistData.responsible_id || undefined,
        questions,
        groups: []
      };

      setChecklist(mappedChecklist);
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      handleApiError(err, "Erro ao buscar checklist");
    } finally {
      setLoading(false);
    }
  };

  // Busca o checklist quando o ID muda
  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

  return { 
    checklist, 
    loading, 
    error,
    isLoading: loading,
    refetch: fetchChecklist
  };
}
