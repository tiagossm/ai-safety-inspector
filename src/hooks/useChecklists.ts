
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Checklist = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status_checklist: "ativo" | "inativo";
  is_template: boolean;
  user_id: string;
};

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla";
  obrigatorio: boolean;
  ordem: number;
  opcoes: string[] | null;
};

export type CollaboratorType = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

export type NewChecklist = {
  title: string;
  description: string | null;
  is_template: boolean;
};

export function useChecklists() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "templates" | "custom">("all");

  // Obter todos os checklists
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("Buscando checklists...");
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar checklists:", error);
        throw error;
      }

      // Transformando os dados para adicionar informações de colaboradores (mockados por enquanto)
      return data.map((checklist) => ({
        ...checklist,
        collaborators: generateMockCollaborators(2),
        items: Math.floor(Math.random() * 20) + 5, // Número aleatório entre 5 e 25
        permissions: ["editor"],
        isTemplate: checklist.is_template
      }));
    }
  });

  // Criar novo checklist
  const createChecklist = useMutation({
    mutationFn: async (newChecklist: NewChecklist) => {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template,
          status_checklist: "ativo",
        })
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
    }
  });

  // Atualizar checklist
  const updateChecklist = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Checklist> }) => {
      const { error } = await supabase
        .from("checklists")
        .update(data)
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar checklist:", error);
      toast.error("Erro ao atualizar checklist. Tente novamente.");
    }
  });

  // Deletar checklist
  const deleteChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir checklist:", error);
      toast.error("Erro ao excluir checklist. Tente novamente.");
    }
  });

  // Funções auxiliares para filtrar checklists
  const filteredChecklists = checklists
    ? checklists.filter((checklist) => {
        // Filtrar por texto
        const matchesSearch = 
          !searchTerm || 
          checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filtrar por tipo
        const matchesType = 
          filterType === "all" || 
          (filterType === "templates" && checklist.is_template) || 
          (filterType === "custom" && !checklist.is_template);
        
        return matchesSearch && matchesType;
      })
    : [];

  // Função auxiliar para gerar colaboradores mockados
  function generateMockCollaborators(count: number): CollaboratorType[] {
    const names = ["Ana Silva", "Bruno Costa", "Carla Lima", "Daniel Freitas", "Eduardo Santos", "Fernanda Oliveira"];
    const collaborators: CollaboratorType[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const nameParts = name.split(" ");
      const initials = nameParts.map(part => part[0]).join("");
      
      collaborators.push({
        id: `mock-${i}`,
        name,
        avatar: "",
        initials
      });
    }
    
    return collaborators;
  }

  return {
    checklists: filteredChecklists,
    isLoading,
    error,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    refetch,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType
  };
}
