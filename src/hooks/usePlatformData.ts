
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
        
        // Como acabamos de criar a tabela platform, podemos começar com valores padrão
        let platform_id = null;
        
        // Verify if platform exists
        const { data: platformData, error: platformError } = await supabase
          .from('platform')
          .select('id')
          .maybeSingle();
        
        if (platformError && platformError.code !== 'PGRST116') {
          // PGRST116 is "No rows returned" which is expected if platform wasn't created yet
          throw platformError;
        }
        
        // If platform exists, use its ID
        if (platformData?.id) {
          platform_id = platformData.id;
        } else {
          // If not, create the platform (in production, this would be done in a more controlled way)
          const { data: newPlatform, error: createError } = await supabase
            .from('platform')
            .insert({
              name: 'IASST',
              owner_id: '00000000-0000-0000-0000-000000000000' // Placeholder, would be current user's ID
            })
            .select('id')
            .single();
            
          if (createError) throw createError;
          if (newPlatform) platform_id = newPlatform.id;
        }
        
        setPlatformId(platform_id);
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, fantasy_name, status, created_at');
        
        if (companiesError) throw companiesError;
        
        // Format companies data
        const formattedCompanies: PlatformCompany[] = (companiesData || []).map(company => ({
          id: company.id,
          name: company.fantasy_name || "Empresa sem nome",
          plan_type: "free", // Default to free since we don't have this field yet
          subscription_active: company.status === "active",
          users_count: 0, // Would need a proper count query
          created_at: company.created_at
        }));
        
        setCompanies(formattedCompanies);
        
        // Fetch users - this might need adjustments based on the current schema
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, tier');
        
        if (usersError) throw usersError;
        
        // Need to handle the possibility that users don't have the tier field yet
        const formattedUsers: PlatformUser[] = (usersData || []).map(user => ({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          tier: (user.tier as "super_admin" | "company_admin" | "consultant" | "technician") || "technician",
          company_id: null // Would need a proper join with user_companies
        }));
        
        setUsers(formattedUsers);
        
        // Check for platform metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('platform_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (metricsError && metricsError.code !== 'PGRST116') {
          throw metricsError;
        }
        
        if (metricsData) {
          setMetrics({
            active_companies: metricsData.active_companies,
            total_inspections: metricsData.total_inspections,
            mrr: metricsData.mrr
          });
        } else {
          // Create sample metrics if none exist
          const demoMetrics = {
            active_companies: formattedCompanies.filter(c => c.subscription_active).length,
            total_inspections: 128,
            mrr: formattedCompanies.reduce((total, company) => {
              const planPrices = { free: 0, pro: 299, enterprise: 999 };
              return total + planPrices[company.plan_type];
            }, 0)
          };
          
          // Optionally save these demo metrics to the database
          try {
            await supabase
              .from('platform_metrics')
              .insert({
                active_companies: demoMetrics.active_companies,
                total_inspections: demoMetrics.total_inspections,
                mrr: demoMetrics.mrr
              });
          } catch (error) {
            console.error("Error saving demo metrics:", error);
            // Non-critical error, continue
          }
          
          setMetrics(demoMetrics);
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
