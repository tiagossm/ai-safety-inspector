import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistById(checklistId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    async function fetchChecklistData() {
      if (!checklistId) {
        setLoading(false);
        setError("ID do checklist não fornecido");
        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        setChecklist(checklistData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("checklist_questions")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("order", { ascending: true });

        if (questionsError) {
          throw new Error(`Erro ao buscar perguntas: ${questionsError.message}`);
        }

        // Fetch groups
        const { data: groupsData, error: groupsError } = await supabase
          .from("checklist_groups")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("order", { ascending: true });

        if (groupsError) {
          throw new Error(`Erro ao buscar grupos: ${groupsError.message}`);
        }

        // Process questions to add normalized response types and group references
        const processedQuestions = questionsData.map((question) => {
          // Normalize response type
          const normalizedType = normalizeResponseType(question.response_type);
          
          // Parse options if they exist and are in string format
          let options = question.options;
          if (typeof options === 'string') {
            try {
              options = JSON.parse(options);
            } catch (e) {
              // If parsing fails, keep as string
              console.warn(`Failed to parse options for question ${question.id}:`, e);
            }
          }
          
          return {
            id: question.id,
            text: question.text,
            description: question.description,
            responseType: normalizedType,
            required: question.required,
            order: question.order,
            groupId: question.group_id,
            options: options,
            metadata: question.metadata || {},
            createdAt: question.created_at,
            updatedAt: question.updated_at
          };
        });

        // Process groups
        const processedGroups = groupsData.map((group) => ({
          id: group.id,
          title: group.title,
          description: group.description,
          order: group.order,
          createdAt: group.created_at,
          updatedAt: group.updated_at
        }));

        setQuestions(processedQuestions);
        setGroups(processedGroups);
      } catch (err: any) {
        console.error("Error in useChecklistById:", err);
        setError(err.message || "Erro ao carregar checklist");
        toast.error(err.message || "Erro ao carregar checklist");
      } finally {
        setLoading(false);
      }
    }

    fetchChecklistData();
  }, [checklistId]);

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
    loading,
    error,
    checklist,
    questions,
    groups
  };
}
