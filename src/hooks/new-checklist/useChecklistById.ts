import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { v4 as uuidv4 } from "uuid";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper function to normalize response type
const normalizeResponseType = (responseType: string): ChecklistQuestion["responseType"] => {
  if (!responseType) return "text";
  
  const type = responseType.toLowerCase();
  
  if (type.includes("sim") || type.includes("não") || type.includes("nao") || type.includes("yes") || type.includes("no")) {
    return "yes_no";
  }
  
  if (type.includes("múltipla") || type.includes("multipla") || type.includes("multiple") || type.includes("choice")) {
    return "multiple_choice";
  }
  
  if (type.includes("número") || type.includes("numero") || type.includes("numeric")) {
    return "numeric";
  }
  
  if (type.includes("texto") || type.includes("text")) {
    return "text";
  }
  
  if (type.includes("foto") || type.includes("photo") || type.includes("imagem") || type.includes("image")) {
    return "text"; // Convertido para texto com permissão de mídia
  }
  
  if (type.includes("assinatura") || type.includes("signature")) {
    return "text"; // Convertido para texto
  }
  
  if (type.includes("parágrafo") || type.includes("paragraph")) {
    return "paragraph";
  }
  
  if (type.includes("dropdown") || type.includes("lista")) {
    return "dropdown";
  }
  
  if (type.includes("multiple_select") || type.includes("caixas")) {
    return "multiple_select";
  }
  
  if (type.includes("date") || type.includes("data")) {
    return "date";
  }
  
  if (type.includes("time") || type.includes("hora")) {
    return "time";
  }
  
  if (type.includes("datetime") || type.includes("data e hora")) {
    return "datetime";
  }
  
  return "text"; // Default to text if no match is found
};

// Helper function to transform raw checklist data
const transformChecklistData = (data: any): ChecklistWithStats | null => {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    isTemplate: data.is_template || false,
    status: data.status || "active",
    category: data.category || "",
    responsibleId: data.responsible_id || null,
    companyId: data.company_id || null,
    userId: data.user_id || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    dueDate: data.due_date,
    isSubChecklist: data.is_sub_checklist || false,
    origin: data.origin || "manual",
    totalQuestions: data.total_questions || 0,
    completedQuestions: 0,
    questions: [], // Will be populated separately
    groups: []     // Will be populated separately
  };
};

// Helper function to ensure options are always an array of strings
const normalizeOptions = (options: any): string[] => {
  if (!options) return [];
  
  if (Array.isArray(options)) {
    // Ensure all items are strings
    return options.map(item => String(item));
  } 
  
  if (typeof options === 'string') {
    try {
      // Try to parse if it's a JSON string
      const parsedOptions = JSON.parse(options);
      if (Array.isArray(parsedOptions)) {
        return parsedOptions.map(item => String(item));
      }
      // If parsed but not an array, wrap in array
      return [String(parsedOptions)];
    } catch (e) {
      // If not valid JSON, treat as single string option
      return [options];
    }
  }
  
  // If it's an object or something else, stringify it
  return [String(options)];
};

export function useChecklistById(checklistId: string | undefined) {
  const query = useQuery({
    queryKey: ["checklists", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        throw new Error("ID do checklist não fornecido");
      }

      // Validate UUID format to prevent DB errors
      if (!isValidUUID(checklistId)) {
        console.error("Invalid UUID format:", checklistId);
        throw new Error("ID de checklist inválido");
      }

      try {
        console.log(`Fetching checklist with ID: ${checklistId}`);
        // Fetch checklist data
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();

        if (checklistError) {
          throw new Error(`Erro ao buscar checklist: ${checklistError.message}`);
        }

        if (!checklistData) {
          throw new Error("Checklist não encontrado");
        }

        // Fetch questions from checklist_itens table
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (questionsError) {
          throw new Error(`Erro ao buscar perguntas: ${questionsError.message}`);
        }

        console.log("Checklist carregado:", checklistData);
        console.log("Perguntas carregadas:", questionsData);

        // Extract group information from questions or create default group
        const groupsMap = new Map();
        const defaultGroupId = uuidv4();
        const defaultGroup = { id: defaultGroupId, title: "Geral", order: 0 };
        groupsMap.set(defaultGroupId, defaultGroup);

        // Process questions to normalize formats
        const processedQuestions: ChecklistQuestion[] = questionsData.map((question) => {
          // Normalize response type
          const normalizedType = normalizeResponseType(question.tipo_resposta);
          
          // Parse options if they exist and ensure they're in the expected format
          let normalizedOptions = normalizeOptions(question.opcoes);
          
          // Extract group info from hint if it exists
          let groupId = defaultGroupId;
          if (question.hint) {
            try {
              const hintData = JSON.parse(question.hint);
              if (hintData && hintData.groupId && hintData.groupTitle) {
                groupId = hintData.groupId;
                if (!groupsMap.has(groupId)) {
                  groupsMap.set(groupId, {
                    id: groupId,
                    title: hintData.groupTitle,
                    order: hintData.groupOrder || 0
                  });
                }
              }
            } catch (e) {
              // If parsing fails, keep default group
            }
          }
          
          return {
            id: question.id,
            text: question.pergunta,
            // Changed from question.description to question.pergunta as description doesn't exist
            description: "", 
            responseType: normalizedType,
            isRequired: question.obrigatorio,
            order: question.ordem,
            groupId: groupId,
            options: normalizedOptions, // Using normalized options that are guaranteed to be string[]
            metadata: {}, // Default empty metadata
            allowsPhoto: question.permite_foto || false,
            allowsVideo: question.permite_video || false,
            allowsAudio: question.permite_audio || false,
            allowsFiles: question.permite_files || false,
            parentQuestionId: question.parent_item_id || null,
            conditionValue: question.condition_value || null,
            createdAt: question.created_at,
            updatedAt: question.updated_at,
            weight: question.weight || 1
          };
        });

        // Convert the groups map to an array and sort by order
        const processedGroups = Array.from(groupsMap.values()).sort(
          (a: any, b: any) => a.order - b.order
        );

        // Transform the data to expected format with camelCase properties
        const checklist = transformChecklistData(checklistData);
        if (checklist) {
          checklist.questions = processedQuestions;
          checklist.groups = processedGroups;
          checklist.totalQuestions = processedQuestions.length;
        }

        // Adicione logs para depuração
        console.log("Checklist normalizado:", checklist);
        console.log("Groups normalizados:", processedGroups);

        return {
          checklist,
          questions: processedQuestions,
          groups: processedGroups
        };
      } catch (err: any) {
        throw new Error(err.message || "Erro ao carregar checklist");
      }
    },
    enabled: !!checklistId && checklistId !== "editor",
    staleTime: 60000, // 1 minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Also provide legacy API format for compatibility
    loading: query.isLoading,
    checklist: query.data?.checklist || null,
    questions: query.data?.questions || [],
    groups: query.data?.groups || []
  };
}
