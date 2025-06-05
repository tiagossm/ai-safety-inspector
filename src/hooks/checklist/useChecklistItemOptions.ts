
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItemOption } from "@/types/multipleChoice";
import { toast } from "sonner";

export function useChecklistItemOptions(itemId: string) {
  const queryClient = useQueryClient();

  const { data: options = [], isLoading, error } = useQuery({
    queryKey: ["checklist-item-options", itemId],
    queryFn: async () => {
      if (!itemId || itemId.startsWith('new-')) return [];

      const { data, error } = await supabase
        .from("checklist_item_options")
        .select("*")
        .eq("item_id", itemId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Erro ao buscar opções:", error);
        throw error;
      }

      return data as ChecklistItemOption[];
    },
    enabled: !!itemId && !itemId.startsWith('new-'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const saveOptions = useMutation({
    mutationFn: async ({ itemId, options }: { itemId: string; options: ChecklistItemOption[] }) => {
      // Primeiro, deletar todas as opções existentes
      const { error: deleteError } = await supabase
        .from("checklist_item_options")
        .delete()
        .eq("item_id", itemId);

      if (deleteError) throw deleteError;

      // Inserir as novas opções
      if (options.length > 0) {
        const optionsToInsert = options.map((option, index) => ({
          item_id: itemId,
          option_text: option.option_text,
          option_value: option.option_value || option.option_text,
          sort_order: index,
          score: option.score || 0,
          is_correct: option.is_correct || false,
        }));

        const { error: insertError } = await supabase
          .from("checklist_item_options")
          .insert(optionsToInsert);

        if (insertError) throw insertError;
      }

      return options;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-item-options", itemId] });
      toast.success("Opções salvas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar opções:", error);
      toast.error("Erro ao salvar opções");
    },
  });

  return {
    options,
    isLoading,
    error,
    saveOptions: saveOptions.mutate,
    isSaving: saveOptions.isPending,
  };
}
