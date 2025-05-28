import { useState, useMemo, useCallback } from 'react';
import { ChecklistWithStats } from "@/types/checklist";

/**
 * Hook para gerenciar filtros e busca de checklists
 * @param checklists Lista de checklists já filtrados pelo servidor
 * @param allChecklists Lista completa de checklists para extração de categorias
 */
export function useChecklistFilters(checklists: ChecklistWithStats[], allChecklists: ChecklistWithStats[]) {
  // Estado dos filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_at_desc");

  // Extrai categorias únicas dos checklists
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    allChecklists.forEach(checklist => {
      if (checklist.category) {
        uniqueCategories.add(checklist.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [allChecklists]);

  // Normaliza o termo de busca para pesquisa eficiente
  const normalizedSearchTerm = useMemo(() => 
    searchTerm.trim().toLowerCase(),
    [searchTerm]
  );

  // Função para verificar se um checklist corresponde ao termo de busca
  const checklistMatchesSearch = useCallback((checklist: ChecklistWithStats, term: string) => {
    if (!term) return true;
    
    return (
      (checklist.title?.toLowerCase().includes(term)) ||
      (checklist.description?.toLowerCase().includes(term)) ||
      (checklist.category?.toLowerCase().includes(term)) ||
      (checklist.companyName?.toLowerCase().includes(term)) ||
      (checklist.responsibleName?.toLowerCase().includes(term))
    );
  }, []);

  // Aplica o filtro de busca sobre os filtros do servidor
  const filteredChecklists = useMemo(() => {
    if (!normalizedSearchTerm) {
      return checklists;
    }
    
    return checklists.filter(checklist => 
      checklistMatchesSearch(checklist, normalizedSearchTerm)
    );
  }, [checklists, normalizedSearchTerm, checklistMatchesSearch]);

  return {
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
    categories,
    filteredChecklists
  };
}
