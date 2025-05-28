import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

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

interface Group {
  id: string;
  title: string;
  order: number;
}

interface SimpleInspectionResponse {
  id: string;
  inspection_id: string;
  inspection_item_id: string;
  answer: string;
  comments?: string;
  notes?: string;
  action_plan?: string;
  media_urls?: string[];
  sub_checklist_responses?: any;
  completed_at?: string;
  updated_at: string;
  created_at: string;
}

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const normalizeQuestion = useCallback((item: any): Question => {
    const rawResponseType = item.responseType || item.tipo_resposta || 'text';
    const normalizedResponseType = normalizeResponseType(rawResponseType);
    
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
      groupId: item.groupId || item.group_id || "default-group",
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

  const processGroups = useCallback((questions: Question[]): Group[] => {
    const groupsMap = new Map<string, Group>();
    
    // Grupo padrão sempre existe
    groupsMap.set("default-group", {
      id: "default-group",
      title: "Perguntas Gerais",
      order: 0
    });

    // Processar grupos das perguntas
    questions.forEach((question) => {
      const groupId = question.groupId || "default-group";
      
      if (groupId !== "default-group" && !groupsMap.has(groupId)) {
        // Tentar extrair nome do grupo do hint se existir
        let groupTitle = `Grupo ${groupsMap.size}`;
        
        if (question.hint) {
          try {
            const hintObj = JSON.parse(question.hint);
            if (hintObj.groupTitle) {
              groupTitle = hintObj.groupTitle;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        groupsMap.set(groupId, {
          id: groupId,
          title: groupTitle,
          order: groupsMap.size
        });
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
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
          setCompany(companyData);
        }
      }

      // Buscar responsáveis
      if (inspectionData.responsible_ids && inspectionData.responsible_ids.length > 0) {
        const { data: responsibleData, error: responsibleError } = await supabase
          .from("users")
          .select("*")
          .eq("id", inspectionData.responsible_ids[0])
          .single();

        if (responsibleError) {
          console.error("[useInspectionFetch] Error fetching responsible from array:", responsibleError);
        } else {
          setResponsible(responsibleData);
        }
      } else if (inspectionData.responsible_id) {
        const { data: responsibleData, error: responsibleError } = await supabase
          .from("users")
          .select("*")
          .eq("id", inspectionData.responsible_id)
          .single();

        if (responsibleError) {
          console.error("[useInspectionFetch] Error fetching responsible:", responsibleError);
        } else {
          setResponsible(responsibleData);
        }
      }

      // Buscar perguntas do checklist
      let questionsProcessed: Question[] = [];
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

        questionsProcessed = questionsData.map(normalizeQuestion);
        setQuestions(questionsProcessed);
        
        // Processar grupos
        const processedGroups = processGroups(questionsProcessed);
        setGroups(processedGroups);
      }

      // Buscar respostas existentes - usando inspection_item_id
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (responsesError) {
        console.error("[useInspectionFetch] Error fetching responses:", responsesError);
      } else {
        const responsesMap: Record<string, any> = {};
        responsesData.forEach((response: SimpleInspectionResponse) => {
          // Usar inspection_item_id como chave
          const questionId = response.inspection_item_id;
          responsesMap[questionId] = {
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
        
        setResponses(responsesMap);
      }

      console.log("[useInspectionFetch] Dados carregados com sucesso:", {
        inspection: !!inspectionData,
        company: !!company,
        responsible: !!responsible,
        questions: questionsProcessed?.length || 0
      });

    } catch (err: any) {
      console.error("[useInspectionFetch] Error in fetchInspectionData:", err);
      setError(err.message || "Erro ao carregar dados da inspeção");
      setDetailedError(err);
      toast.error(`Erro ao carregar inspeção: ${err.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, normalizeQuestion, processGroups]);

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
