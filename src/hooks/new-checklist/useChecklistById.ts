
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

// Function to validate UUID format
const isValidUUID = (id: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper function to normalize response type
const normalizeResponseType = (responseType: string): "text" | "yes_no" | "multiple_choice" | "numeric" | "photo" | "signature" => {
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
    return "photo";
  }
  
  if (type.includes("assinatura") || type.includes("signature")) {
    return "signature";
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

        // Extract group information from questions or create default group
        const groupsMap = new Map();
        const defaultGroup = { id: "default", title: "Geral", order: 0 };
        groupsMap.set("default", defaultGroup);

        // Process questions to normalize formats
        const processedQuestions = questionsData.map((question) => {
          // Normalize response type
          const normalizedType = normalizeResponseType(question.tipo_resposta);
          
          // Parse options if they exist
          let options = question.opcoes || [];
          if (typeof options === 'string') {
            try {
              options = JSON.parse(options);
            } catch (e) {
              options = [];
            }
          }
          
          // Extract group info from hint if it exists
          let groupId = "default";
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
            description: question.descricao || "",
            responseType: normalizedType,
            isRequired: question.obrigatorio,
            order: question.ordem,
            groupId: groupId,
            options: options || [],
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
