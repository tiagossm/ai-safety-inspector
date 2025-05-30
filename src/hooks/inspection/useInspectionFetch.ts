import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

import { PostgrestError } from "@supabase/supabase-js";

// Define more specific types based on expected DB structure / API responses
// These are placeholders and should be refined based on actual schema.
interface BaseRow {
  id: string;
  created_at?: string;
  updated_at?: string;
}

interface InspectionRow extends BaseRow {
  status: string | null;
  checklist_id: string | null;
  company_id: string | null;
  responsible_id: string | null; // Assuming single responsible for now, or adjust if it's an array from DB
  responsible_ids?: string[] | null; // If it can be an array
  scheduled_date: string | null;
  location: string | null;
  priority: string | null;
  metadata: Record<string, any> | null;
  inspection_type: string | null;
  // user_id: string; // If user_id is part of inspections table
}

interface CompanyRow extends BaseRow {
  fantasy_name: string | null;
  // other company fields
}

interface UserRow extends BaseRow {
  name: string | null;
  email?: string | null;
  phone?: string | null;
  // other user fields
}

interface RawChecklistItem extends BaseRow {
  text?: string | null;
  pergunta?: string | null;
  responseType?: string | null;
  tipo_resposta?: string | null;
  isRequired?: boolean | null;
  obrigatorio?: boolean | null;
  options?: string[] | null;
  opcoes?: string[] | null;
  weight?: number | null;
  allowsPhoto?: boolean | null;
  permite_foto?: boolean | null;
  allowsVideo?: boolean | null;
  permite_video?: boolean | null;
  allowsAudio?: boolean | null;
  permite_audio?: boolean | null;
  allowsFiles?: boolean | null;
  permite_files?: boolean | null;
  order?: number | null;
  ordem?: number | null;
  groupId?: string | null;
  group_id?: string | null;
  condition?: string | null;
  conditionValue?: string | null;
  condition_value?: string | null;
  parentQuestionId?: string | null;
  parent_item_id?: string | null;
  hasSubChecklist?: boolean | null;
  has_subchecklist?: boolean | null;
  subChecklistId?: string | null;
  sub_checklist_id?: string | null;
  hint?: string | null;
  checklist_id?: string; // Foreign key
}

interface Question { // This is the processed/normalized question type
  id: string;
  text: string; // Assuming text is preferred and always present after normalization
  responseType: string; // Normalized
  isRequired: boolean;
  options: string[];
  weight: number;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsFiles: boolean;
  order: number;
  groupId: string;
  condition?: string | null;
  conditionValue?: string | null;
  parentQuestionId?: string | null;
  hasSubChecklist: boolean;
  subChecklistId?: string | null;
  hint?: string | null;
  // Removed redundant pt-BR fields like 'pergunta' if 'text' is canonical post-normalization
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
  action_plan?: string | null;
  media_urls?: string[] | null;
  sub_checklist_responses?: Record<string, unknown> | null; // More specific than any
  completed_at?: string | null;
  updated_at: string; // Assuming this is always present
  created_at: string;
}

// Type for the value part of the responses map
interface ResponseValue {
  value: string | string[] | number | boolean | null; // Adjust as per actual response values
  mediaUrls?: string[] | null;
  comments?: string | null;
  notes?: string | null;
  actionPlan?: string | null;
  subChecklistResponses?: Record<string, unknown> | null;
  completedAt?: string | null;
  updatedAt: string;
}

interface FullInspectionData {
  inspection: InspectionRow | null; // Use specific row type
  questions: Question[];
  groups: Group[];
  initialResponses: Record<string, ResponseValue>; // Use specific response value type
  company: CompanyRow | null; // Use specific row type
  responsible: UserRow | null; // Use specific row type
  subChecklists: Record<string, unknown>; // Use unknown instead of any
}

// Utility functions moved outside the hook for clarity
const normalizeQuestionUtil = (item: RawChecklistItem): Question => {
  const rawResponseType = item.responseType ?? item.tipo_resposta ?? 'text';
  const normalizedResponseType = normalizeResponseType(rawResponseType ?? 'text'); // Ensure rawResponseType is not null
  return {
    id: item.id, // id is not nullable in BaseRow
    text: item.text ?? item.pergunta ?? "", // Default to empty string if both are null
    responseType: normalizedResponseType,
    isRequired: item.isRequired ?? item.obrigatorio ?? false,
    options: item.options ?? item.opcoes ?? [],
    weight: item.weight ?? 1,
    allowsPhoto: item.allowsPhoto ?? item.permite_foto ?? false,
    allowsVideo: item.allowsVideo ?? item.permite_video ?? false,
    allowsAudio: item.allowsAudio ?? item.permite_audio ?? false,
    allowsFiles: item.allowsFiles ?? item.permite_files ?? false,
    order: item.order ?? item.ordem ?? 0,
    groupId: item.groupId ?? item.group_id ?? "default-group",
    condition: item.condition,
    conditionValue: item.conditionValue ?? item.condition_value,
    parentQuestionId: item.parentQuestionId ?? item.parent_item_id,
    hasSubChecklist: item.hasSubChecklist ?? item.has_subchecklist ?? false,
    subChecklistId: item.subChecklistId ?? item.sub_checklist_id,
    hint: item.hint
  };
};

const processGroupsUtil = (questions: Question[]): Group[] => {
  const groupsMap = new Map<string, Group>();
  groupsMap.set("default-group", { id: "default-group", title: "Perguntas Gerais", order: 0 });
  questions.forEach((question) => {
    const groupId = question.groupId || "default-group"; // groupId is not nullable in Question type
    if (groupId !== "default-group" && !groupsMap.has(groupId)) {
      let groupTitle = `Grupo ${groupsMap.size}`;
      if (question.hint) { // Check if hint is not null/undefined
        try {
          // Make sure question.hint is a string before parsing
          const hintObj = JSON.parse(question.hint as string) as { groupTitle?: string };
          if (hintObj.groupTitle) groupTitle = hintObj.groupTitle;
        } catch (e) { /* Ignore parsing errors */ }
      }
      groupsMap.set(groupId, { id: groupId, title: groupTitle, order: groupsMap.size });
    }
  });
  return Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
};


const fetchFullInspectionDetails = async (inspectionId: string): Promise<FullInspectionData> => {
  console.log(`[useInspectionFetch] QueryFn: Fetching inspection data for ID: ${inspectionId}`);

  const { data: inspectionData, error: inspectionError } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", inspectionId)
    .returns<InspectionRow[]>() // Expect an array, then take the first or null.
    .maybeSingle(); // Use maybeSingle to return null instead of error if not found

  if (inspectionError) {
    console.error("[useInspectionFetch] QueryFn: Error fetching inspection:", inspectionError);
    // Do not throw if it's a "not found" error that maybeSingle handles by returning null data
    if (inspectionError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" (or multiple)
        throw inspectionError;
    }
  }
  // inspectionData is InspectionRow | null here

  let companyData: CompanyRow | null = null;
  if (inspectionData?.company_id) { // Check inspectionData is not null
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", inspectionData.company_id)
      .returns<CompanyRow[]>()
      .maybeSingle();
    if (error && error.code !== 'PGRST116') console.error("[useInspectionFetch] QueryFn: Error fetching company:", error);
    else companyData = data ?? null;
  }

  let responsibleData: UserRow | null = null;
  const responsibleFetchId = inspectionData?.responsible_ids?.[0] || inspectionData?.responsible_id;
  if (responsibleFetchId) { // Check responsibleFetchId is not null/undefined
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", responsibleFetchId)
      .returns<UserRow[]>()
      .maybeSingle();
    if (error && error.code !== 'PGRST116') console.error("[useInspectionFetch] QueryFn: Error fetching responsible:", error);
    else responsibleData = data ?? null;
  }

  let questionsProcessed: Question[] = [];
  let processedGroups: Group[] = [];
  if (inspectionData?.checklist_id) { // Check inspectionData is not null
    const { data: questionsData, error: questionsError } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", inspectionData.checklist_id)
      .order("ordem")
      .returns<RawChecklistItem[]>(); // Expect an array of RawChecklistItem

    if (questionsError) {
      console.error("[useInspectionFetch] QueryFn: Error fetching questions:", questionsError);
      throw questionsError; // Or handle more gracefully
    }
    if (questionsData) { // Check questionsData is not null
        questionsProcessed = questionsData.map(normalizeQuestionUtil);
        processedGroups = processGroupsUtil(questionsProcessed);
    }
  }

  const initialResponsesMap: Record<string, ResponseValue> = {};
  // Ensure inspectionId is valid before using it in a query
  if (inspectionId) {
      const { data: responsesData, error: responsesError } = await supabase
        .from("inspection_responses")
        .select("*")
        .eq("inspection_id", inspectionId)
        .returns<SimpleInspectionResponse[]>(); // Expect an array

    if (responsesError) {
      console.error("[useInspectionFetch] QueryFn: Error fetching responses:", responsesError);
    } else if (responsesData) { // Check responsesData is not null
      responsesData.forEach((response) => { // response is SimpleInspectionResponse
        const questionId = response.inspection_item_id; // Not null in SimpleInspectionResponse
        initialResponsesMap[questionId] = {
          value: response.answer, // Not null in SimpleInspectionResponse
          mediaUrls: response.media_urls,
          comments: response.comments,
          notes: response.notes,
          actionPlan: response.action_plan,
          subChecklistResponses: response.sub_checklist_responses,
          completedAt: response.completed_at,
          updatedAt: response.updated_at // Not null in SimpleInspectionResponse
        };
      });
    }
  }
  
  console.log("[useInspectionFetch] QueryFn: Data fetched successfully.");
  return {
    inspection: inspectionData, // Can be null
    questions: questionsProcessed,
    groups: processedGroups,
    initialResponses: initialResponsesMap,
    company: companyData, // Can be null
    responsible: responsibleData, // Can be null
    subChecklists: {} // Placeholder, as in original hook
  };
};

export function useInspectionFetch(inspectionId: string | undefined) {
  const [editableResponses, setEditableResponses] = useState<Record<string, ResponseValue>>({});

  const queryResult = useQuery<FullInspectionData, Error, FullInspectionData, [string, string | undefined]>(
    ['inspection', inspectionId],
    () => {
      if (!inspectionId) {
        return Promise.reject(new Error("ID da inspeção não fornecido para queryFn"));
      }
      return fetchFullInspectionDetails(inspectionId);
    },
    {
      enabled: !!inspectionId,
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 30, 
      onError: (err: Error) => { // Explicitly type err
        toast.error(`Erro ao carregar dados da inspeção: ${err.message}`);
        console.error("[useInspectionFetch] Query Error:", err);
      }
    }
  );

  useEffect(() => {
    if (queryResult.data?.initialResponses) {
      setEditableResponses(queryResult.data.initialResponses);
    }
  }, [queryResult.data?.initialResponses]);
  
  return {
    loading: queryResult.isLoading,
    error: queryResult.error ? queryResult.error.message : null, // queryResult.error is Error | null
    detailedError: queryResult.error, 
    inspection: queryResult.data?.inspection ?? null, // Default to null if data or inspection is undefined
    questions: queryResult.data?.questions ?? [],
    groups: queryResult.data?.groups ?? [],
    responses: editableResponses, 
    company: queryResult.data?.company ?? null,
    responsible: queryResult.data?.responsible ?? null,
    subChecklists: queryResult.data?.subChecklists ?? {},
    setResponses: setEditableResponses,
    refreshData: queryResult.refetch
  };
}
