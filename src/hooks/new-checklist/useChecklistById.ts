import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function useChecklistById(checklistId: string | undefined) {
  const query = useQuery({
    queryKey: ["checklists", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        throw new Error("ID do checklist não fornecido");
      }

      try {
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
            updatedAt: question.updated_at
          };
        });

        // Convert the groups map to an array and sort by order
        const processedGroups = Array.from(groupsMap.values()).sort(
          (a: any, b: any) => a.order - b.order
        );

        return {
          checklist: checklistData,
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

  // Normalize response type function
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

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Also provide legacy API format for compatibility
    loading: query.isLoading,
    checklist: query.data?.checklist,
    questions: query.data?.questions || [],
    groups: query.data?.groups || []
  };
}
