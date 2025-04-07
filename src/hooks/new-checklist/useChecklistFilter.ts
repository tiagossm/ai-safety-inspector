
import { useState, useEffect } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyOption {
  id: string;
  name: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export type SortOrder = "newest" | "oldest";

export function useChecklistFilter(checklists: ChecklistWithStats[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive" | "template">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Fetch companies associated with checklists
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        
        // Extract unique company IDs from checklists
        const companyIds = Array.from(
          new Set(
            checklists
              .filter(c => c.companyId)
              .map(c => c.companyId)
          )
        ).filter(Boolean) as string[];
        
        if (!companyIds || companyIds.length === 0) {
          console.log("No companies to fetch - no company IDs in checklists");
          setCompanies([]);
          return;
        }
        
        // Log the request for debugging
        console.log(`Fetching ${companyIds.length} companies with IDs:`, companyIds);
        
        // Validate UUIDs before making the request
        const validCompanyIds = companyIds.filter(id => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const isValid = uuidRegex.test(id);
          if (!isValid) {
            console.warn(`Invalid company ID format: ${id}`);
          }
          return isValid;
        });
        
        if (validCompanyIds.length === 0) {
          console.log("No valid company IDs to fetch");
          setCompanies([]);
          return;
        }
        
        // Build the query filter with the in operator
        const { data, error } = await supabase
          .from("companies")
          .select("id, fantasy_name")
          .in("id", validCompanyIds)
          .order("fantasy_name", { ascending: true });
          
        if (error) {
          console.error("Error fetching companies:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} companies`);
        
        // Map response to match our CompanyOption interface
        const companyOptions: CompanyOption[] = Array.isArray(data) 
          ? data.map(company => ({
              id: company.id,
              name: company.fantasy_name || 'Unnamed Company'
            })) 
          : [];
        
        setCompanies(companyOptions);
        
      } catch (error) {
        console.error("Error in fetchCompanies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    if (checklists.length > 0) {
      fetchCompanies();
    }
  }, [checklists]);

  // Extract unique categories from checklists
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(
        checklists
          .filter(c => c.category)
          .map(c => c.category)
      )
    ).filter(Boolean) as string[];

    const categoryOptions: CategoryOption[] = uniqueCategories.map(category => ({
      value: category,
      label: category
    }));

    // Sort categories alphabetically
    categoryOptions.sort((a, b) => a.label.localeCompare(b.label));

    setCategories(categoryOptions);
  }, [checklists]);

  // Apply all filters at once
  let filteredChecklists = checklists.filter(checklist => {
    // Search filter
    const matchesSearch = !searchTerm || 
      (checklist.title && checklist.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = 
      filterType === "all" || 
      (filterType === "active" && checklist.status === "active" && !checklist.isTemplate) ||
      (filterType === "inactive" && checklist.status === "inactive" && !checklist.isTemplate) ||
      (filterType === "template" && checklist.isTemplate);
    
    // Company filter
    const matchesCompany = !selectedCompanyId || checklist.companyId === selectedCompanyId;
    
    // Category filter
    const matchesCategory = !selectedCategory || checklist.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCompany && matchesCategory;
  });

  // Apply sorting
  filteredChecklists = filteredChecklists.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    companies,
    categories,
    isLoadingCompanies,
    filteredChecklists
  };
}
