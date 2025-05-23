
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/responseTypeMap";

interface Question {
  id: string;
  text?: string;
  pergunta?: string;
  responseType?: string;
  tipo_resposta?: string;
  isRequired?: boolean;
  obrigatorio?: boolean;
  options?: string[];
  opcoes?: string[];
  weight?: number;
  allowsPhoto?: boolean;
  permite_foto?: boolean;
  allowsVideo?: boolean;
  permite_video?: boolean;
  allowsAudio?: boolean;
  permite_audio?: boolean;
  allowsFiles?: boolean;
  permite_files?: boolean;
  order?: number;
  ordem?: number;
  groupId?: string;
  condition?: string;
  conditionValue?: string;
  condition_value?: string;
  parentQuestionId?: string;
  parent_item_id?: string;
  hasSubChecklist?: boolean;
  has_subchecklist?: boolean;
  subChecklistId?: string;
  sub_checklist_id?: string;
  hint?: string;
}

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const normalizeQuestion = useCallback((item: any): Question => {
    // Normalizar o tipo de resposta para garantir consistência
    const rawResponseType = item.responseType || item.tipo_resposta || 'text';
    const normalizedResponseType = normalizeResponseType(rawResponseType);
    
    console.log(`[useInspectionFetch] Normalizing question ${item.id}:`, {
      rawType: rawResponseType,
      normalizedType: normalizedResponseType
    });

    return {
      id: item.id,
      text: item.text || item.pergunta,
      pergunta: item.pergunta || item.text,
      responseType: normalizedResponseType,
      tipo_resposta: normalizedResponseType,
      isRequired: item.isRequired ?? item.obrigatorio ?? false,
      obrigatorio: item.obrigatorio ?? item.isRequired ?? false,
      options: item.options || item.opcoes || [],
      opcoes: item.opcoes || item.options || [],
      weight: item.weight || 1,
      allowsPhoto: item.allowsPhoto ?? item.permite_foto ?? false,
      permite_foto: item.permite_foto ?? item.allowsPhoto ?? false,
      allowsVideo: item.allowsVideo ?? item.permite_video ?? false,
      permite_video: item.permite_video ?? item.allowsVideo ?? false,
      allowsAudio: item.allowsAudio ?? item.permite_audio ?? false,
      permite_audio: item.permite_audio ?? item.allowsAudio ?? false,
      allowsFiles: item.allowsFiles ?? item.permite_files ?? false,
      permite_files: item.permite_files ?? item.allowsFiles ?? false,
      order: item.order ?? item.ordem ?? 0,
      ordem: item.ordem ?? item.order ?? 0,
      groupId: item.groupId || item.group_id,
      condition: item.condition,
      conditionValue: item.conditionValue || item.condition_value,
      condition_value: item.condition_value || item.conditionValue,
      parentQuestionId: item.parentQuestionId || item.parent_item_id,
      parent_item_id: item.parent_item_id || item.parentQuestionId,
      hasSubChecklist: item.hasSubChecklist ?? item.has_subchecklist ?? false,
      has_subchecklist: item.has_subchecklist ?? item.hasSubChecklist ?? false,
      subChecklistId: item.subChecklistId || item.sub_checklist_id,
      sub_checklist_id: item.sub_checklist_id || item.subChecklistId,
      hint: item.hint
    };
  }, []);

  const fetchInspectionData = useCallback(async () => {
    if (!inspectionId) {
      setError("ID da inspeção não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDetailedError(null);

      console.log(`[useInspectionFetch] Fetching inspection data for ID: ${inspectionId}`);

      // Buscar dados da inspeção
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("inspections")
        .select("*")
        .eq("id", inspectionId)
        .single();

      if (inspectionError) {
        console.error("[useInspectionFetch] Error fetching inspection:", inspectionError);
        throw inspectionError;
      }

      console.log("[useInspectionFetch] Inspection data:", inspectionData);
      setInspection(inspectionData);

      // Buscar dados da empresa
      if (inspectionData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", inspectionData.company_id)
          .single();

        if (companyError) {
          console.error("[useInspectionFetch] Error fetching company:", companyError);
        } else {
          console.log("[useInspectionFetch] Company data:", companyData);
          setCompany(companyData);
        }
      }

      // Buscar dados do responsável
      if (inspectionData.responsible_id) {
        const { data: responsibleData, error: responsibleError } = await supabase
          .from("users")
          .select("*")
          .eq("id", inspectionData.responsible_id)
          .single();

        if (responsibleError) {
          console.error("[useInspectionFetch] Error fetching responsible:", responsibleError);
        } else {
          console.log("[useInspectionFetch] Responsible data:", responsibleData);
          setResponsible(responsibleData);
        }
      }

      // Buscar perguntas do checklist
      if (inspectionData.checklist_id) {
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", inspectionData.checklist_id)
          .order("ordem");

        if (questionsError) {
          console.error("[useInspectionFetch] Error fetching questions:", questionsError);
          throw questionsError;
        }

        console.log("[useInspectionFetch] Raw questions data:", questionsData);
        
        // Normalizar as perguntas
        const normalizedQuestions = questionsData.map(normalizeQuestion);
        console.log("[useInspectionFetch] Normalized questions:", normalizedQuestions);
        setQuestions(normalizedQuestions);
      }

      // Buscar respostas existentes
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) {
        console.error("[useInspectionFetch] Error fetching responses:", responsesError);
      } else {
        console.log("[useInspectionFetch] Responses data:", responsesData);
        
        const responsesMap: Record<string, any> = {};
        responsesData.forEach((response) => {
          responsesMap[response.question_id] = {
            value: response.answer,
            mediaUrls: response.media_urls || [],
            comments: response.comments,
            notes: response.notes,
            actionPlan: response.action_plan,
            subChecklistResponses: response.sub_checklist_responses,
            completedAt: response.completed_at,
            updatedAt: response.updated_at
          };
        });
        
        console.log("[useInspectionFetch] Processed responses map:", responsesMap);
        setResponses(responsesMap);
      }

    } catch (err: any) {
      console.error("[useInspectionFetch] Error in fetchInspectionData:", err);
      setError(err.message || "Erro ao carregar dados da inspeção");
      setDetailedError(err);
      toast.error(`Erro ao carregar inspeção: ${err.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, normalizeQuestion]);

  const refreshData = useCallback(() => {
    console.log("[useInspectionFetch] Refreshing data...");
    fetchInspectionData();
  }, [fetchInspectionData]);

  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData
  };
}
