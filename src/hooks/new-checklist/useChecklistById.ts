
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";
import { databaseToFrontendResponseType } from "@/utils/responseTypeMap";

export interface ChecklistWithQuestions {
  id: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  companyId?: string;
  responsibleId?: string;
  questions: ChecklistQuestion[];
}

export function useChecklistById(checklistId: string | undefined) {
  const [checklist, setChecklist] = useState<ChecklistWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapDbTypeToFrontendType = (dbType: string): ChecklistQuestion["responseType"] => {
    const mappedType = databaseToFrontendResponseType(dbType);
    const typeMap: Record<string, ChecklistQuestion["responseType"]> = {
      'sim/não': 'sim/não',
      'seleção múltipla': 'seleção múltipla',
      'texto': 'texto',
      'numérico': 'numérico',
      'foto': 'foto',
      'assinatura': 'assinatura',
      'hora': 'hora',
      'data': 'data'
    };
    return typeMap[mappedType] || 'texto';
  };

  useEffect(() => {
    if (!checklistId) {
      setLoading(false);
      return;
    }

    const fetchChecklist = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch checklist details
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();

        if (checklistError) {
          throw new Error(`Erro ao buscar checklist: ${checklistError.message}`);
        }

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (questionsError) {
          throw new Error(`Erro ao buscar perguntas: ${questionsError.message}`);
        }

        // Map database questions to frontend format
        const questions: ChecklistQuestion[] = (questionsData || []).map((item, index) => ({
          id: item.id,
          text: item.pergunta || "",
          description: "", // Add if needed
          responseType: mapDbTypeToFrontendType(item.tipo_resposta),
          isRequired: item.obrigatorio || false,
          order: item.ordem || index,
          options: Array.isArray(item.opcoes) ? item.opcoes.map(opt => String(opt)) : [],
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          allowsFiles: item.permite_files || false,
          weight: item.weight || 1,
          hint: item.hint || "",
          groupId: item.group_id || undefined,
          condition: item.condition || undefined,
          conditionValue: item.condition_value || undefined,
          parentQuestionId: item.parent_item_id || undefined,
          hasSubChecklist: item.has_subchecklist || false,
          subChecklistId: item.sub_checklist_id || undefined
        }));

        const mappedChecklist: ChecklistWithQuestions = {
          id: checklistData.id,
          title: checklistData.title,
          description: checklistData.description || "",
          category: checklistData.category || "",
          isTemplate: checklistData.is_template || false,
          companyId: checklistData.company_id || undefined,
          responsibleId: checklistData.responsible_id || undefined,
          questions
        };

        setChecklist(mappedChecklist);
      } catch (err) {
        console.error("Error fetching checklist:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistId]);

  return { checklist, loading, error };
}
