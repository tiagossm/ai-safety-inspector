
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PlatformMetrics {
  active_companies: number;
  total_inspections: number;
  mrr: number;
}

export interface PlatformCompany {
  id: string;
  name: string;
  plan_type: "free" | "pro" | "enterprise";
  subscription_active: boolean;
  users_count: number;
  created_at: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  tier: "super_admin" | "company_admin" | "consultant" | "technician";
  company_id: string | null;
}

export function usePlatformData() {
  const [loading, setLoading] = useState(true);
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<PlatformCompany[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    active_companies: 0,
    total_inspections: 0,
    mrr: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true);
        
        // Fetch platform
        const { data: platformData, error: platformError } = await supabase
          .from("platform")
          .select("id")
          .single();
        
        if (platformError) throw platformError;
        
        setPlatformId(platformData?.id || null);
        
        if (platformData?.id) {
          // Fetch companies
          const { data: companiesData, error: companiesError } = await supabase
            .from("companies")
            .select("id, fantasy_name, plan_type, status, created_at");
          
          if (companiesError) throw companiesError;
          
          const formattedCompanies = (companiesData || []).map(company => ({
            id: company.id,
            name: company.fantasy_name || "Empresa sem nome",
            plan_type: (company.plan_type || "free") as "free" | "pro" | "enterprise",
            subscription_active: company.status === "active",
            users_count: 0, // This would need a proper count query
            created_at: company.created_at
          }));
          
          setCompanies(formattedCompanies);
          
          // Fetch users
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, name, email, tier");
          
          if (usersError) throw usersError;
          
          setUsers(usersData || []);
          
          // Fetch metrics
          const { data: metricsData, error: metricsError } = await supabase
            .from("platform_metrics")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (metricsError && metricsError.code !== "PGRST116") {
            // PGRST116 is "No rows returned" which is normal for new platforms
            throw metricsError;
          }
          
          if (metricsData) {
            setMetrics({
              active_companies: metricsData.active_companies,
              total_inspections: metricsData.total_inspections,
              mrr: metricsData.mrr
            });
          } else {
            // Demo metrics if none exist
            setMetrics({
              active_companies: companies.filter(c => c.subscription_active).length,
              total_inspections: 128,
              mrr: companies.reduce((total, company) => {
                const planPrices = { free: 0, pro: 299, enterprise: 999 };
                return total + planPrices[company.plan_type];
              }, 0)
            });
          }
        }
      } catch (error: any) {
        console.error("Error fetching platform data:", error);
        toast({
          title: "Erro ao carregar dados da plataforma",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlatformData();
  }, [toast]);
  
  return {
    platformId,
    companies,
    users,
    metrics,
    loading
  };
}

export function usePlatformCompanies() {
  const { companies, loading } = usePlatformData();
  
  const switchCompany = async (companyId: string) => {
    // In a real app, this would store the current impersonated company in context or state management
    localStorage.setItem("impersonated_company_id", companyId);
    window.location.href = "/dashboard";
  };
  
  return {
    companies,
    loading,
    switchCompany
  };
}
