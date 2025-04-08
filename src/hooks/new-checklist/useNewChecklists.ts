
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";
import { determineChecklistOrigin } from "@/utils/checklist-utils";

export function useNewChecklists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_desc");
  const queryClient = useQueryClient();

  // Fetch checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["new-checklists", filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("checklists")
        .select(`
          *,
          checklist_itens(count),
          companies(fantasy_name),
          users!checklists_responsible_id_fkey(name)
        `);

      // Apply filters
      if (filterType === "template") {
        query = query.eq("is_template", true);
      } else if (filterType === "active") {
        query = query.eq("status", "active").eq("is_template", false);
      } else if (filterType === "inactive") {
        query = query.eq("status", "inactive").eq("is_template", false);
      }

      if (selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Apply sorting
      if (sortOrder === "created_desc") {
        query = query.order("created_at", { ascending: false });
      } else if (sortOrder === "created_asc") {
        query = query.order("created_at", { ascending: true });
      } else if (sortOrder === "title_asc") {
        query = query.order("title", { ascending: true });
      } else if (sortOrder === "title_desc") {
        query = query.order("title", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching checklists:", error);
        throw error;
      }

      // Transform data
      const transformedData: ChecklistWithStats[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isTemplate: item.is_template,
        status: item.status,
        category: item.category,
        responsibleId: item.responsible_id,
        companyId: item.company_id,
        userId: item.user_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        dueDate: item.due_date,
        isSubChecklist: item.is_sub_checklist,
        origin: item.origin,
        totalQuestions: item.checklist_itens?.length || 0,
        completedQuestions: 0,
        companyName: item.companies?.fantasy_name,
        responsibleName: item.users?.name
      }));

      return transformedData;
    }
  });
  
  // Fetch all checklist data only once for filtering
  const { data: allChecklists = [] } = useQuery({
    queryKey: ["all-checklists-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          id, title, description, is_template, status, category, 
          company_id, created_at, updated_at, is_sub_checklist, origin
        `);

      if (error) {
        console.error("Error fetching all checklists data:", error);
        throw error;
      }

      const transformedData: ChecklistWithStats[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isTemplate: item.is_template,
        status: item.status,
        isSubChecklist: item.is_sub_checklist,
        category: item.category,
        companyId: item.company_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        origin: item.origin,
        totalQuestions: 0,
        completedQuestions: 0
      }));

      return transformedData;
    }
  });

  // Fetch companies for filter
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });

      if (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }

      return data;
    }
  });

  // Extract unique categories from all checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allChecklists.forEach((checklist) => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Filter checklists based on search term and origin
  const filteredChecklists = useMemo(() => {
    let filtered = [...checklists];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (checklist) =>
          checklist.title.toLowerCase().includes(search) ||
          (checklist.description && checklist.description.toLowerCase().includes(search)) ||
          (checklist.category && checklist.category.toLowerCase().includes(search))
      );
    }

    // Apply origin filter
    if (selectedOrigin !== "all") {
      filtered = filtered.filter(checklist => {
        const origin = checklist.origin || determineChecklistOrigin(checklist);
        return origin === selectedOrigin;
      });
    }

    return filtered;
  }, [checklists, searchTerm, selectedOrigin]);

  // Delete checklist mutation
  const deleteChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Refetch function
  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    await queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
  };

  return {
    checklists: filteredChecklists,
    allChecklists,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    isLoadingCompanies,
    refetch,
    deleteChecklist
  };
}
