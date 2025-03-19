
import { useState, useEffect } from "react";
import { Checklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyListItem {
  id: string;
  fantasy_name?: string;
  name?: string;
}

export function useFilterChecklists(checklists: Checklist[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "template">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Fetch companies associated with checklists
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        // Extract unique company IDs from checklists
        const companyIds = Array.from(
          new Set(
            checklists
              .filter(c => c.company_id)
              .map(c => c.company_id)
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
          .select("id, fantasy_name, name")
          .in("id", validCompanyIds)
          .order("fantasy_name", { ascending: true });
          
        if (error) {
          console.error("Error fetching companies:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} companies`);
        setCompanies(data || []);
        
      } catch (error) {
        console.error("Error in fetchCompanies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    if (checklists.length > 0) {
      fetchCompanies();
    }
  }, [checklists]);

  // Apply all filters at once
  const filteredChecklists = checklists.filter(checklist => {
    // Search filter
    const matchesSearch = !searchTerm || 
      (checklist.title && checklist.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (checklist.description && checklist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === "all" || 
      (filterType === "active" && checklist.status_checklist === "ativo") ||
      (filterType === "template" && checklist.is_template);
    
    // Company filter
    const matchesCompany = !selectedCompanyId || checklist.company_id === selectedCompanyId;
    
    return matchesSearch && matchesType && matchesCompany;
  });

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    loadingCompanies,
    filteredChecklists
  };
}
