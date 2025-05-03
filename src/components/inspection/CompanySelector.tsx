import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronDown, Building, Plus, Loader2, AlertCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompanyQuickCreateModal } from "./CompanyQuickCreateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface CompanySelectorProps {
  value: string;
  onSelect: (id: string, data: any) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  showTooltip?: boolean;
}

export function CompanySelector({ 
  value, 
  onSelect, 
  className, 
  disabled = false,
  error,
  showTooltip = false
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [companiesTooltip, setCompaniesTooltip] = useState<string>("Selecione uma empresa");

  useEffect(() => {
    if (companies.length === 0) {
      setCompaniesTooltip("Nenhuma empresa disponível");
    } else {
      setCompaniesTooltip("Selecione uma empresa");
    }
  }, [companies]);

  useEffect(() => {
    setInternalError(error);
  }, [error]);

  // Fetch companies on initial load
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Update selected company when value changes
  useEffect(() => {
    if (value) {
      validateCompanyId();
      if (!selectedCompany || selectedCompany.id !== value) {
        fetchCompanyById(value);
      }
    } else {
      setSelectedCompany(null);
    }
  }, [value]);

  const validateCompanyId = async () => {
    if (!value) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      setInternalError("ID de empresa inválido");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, fantasy_name")
        .eq("id", value)
        .single();

      if (error || !data) {
        setInternalError("Empresa não encontrada");
      } else {
        setInternalError(undefined);
      }
    } catch (err) {
      console.error("Error validating company:", err);
    }
  };

  const fetchCompanies = async (query: string = "") => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("companies")
        .select("id, fantasy_name, name, cnpj, cnae, address")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });

      if (query) {
        queryBuilder = queryBuilder.or(`fantasy_name.ilike.%${query}%,name.ilike.%${query}%,cnpj.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(30);

      if (error) {
        console.error("Error fetching companies:", error);
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyById = async (id: string) => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, fantasy_name, cnpj, cnae, address")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching company by ID:", error);
        return;
      }

      if (data) {
        setSelectedCompany(data);
      }
    } catch (error) {
      console.error("Error fetching company by ID:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      setSearching(true);
      await fetchCompanies(query);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCompany = (company: any) => {
    if (!company?.id) {
      console.error("Invalid company data selected:", company);
      return;
    }
    
    setSelectedCompany(company);
    setInternalError(undefined);
    onSelect(company.id, company);
    setOpen(false);
  };

  const handleQuickCreateSuccess = async (companyData: any) => {
    try {
      // Get current user session to retrieve the user_id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        console.error("User is not authenticated");
        return;
      }
      
      // Create the new company with required fields
      const { data, error } = await supabase
        .from("companies")
        .insert({
          fantasy_name: companyData.fantasy_name || companyData.name,
          name: companyData.name || companyData.fantasy_name,
          cnpj: companyData.cnpj,
          cnae: companyData.cnae || null,
          address: companyData.address || null,
          status: "active",
          user_id: userId // Required field
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating company:", error);
        toast({
          title: "Erro ao criar empresa",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        // Add the new company to the list
        setCompanies(prev => [data, ...prev]);
        
        // Select the newly created company
        handleSelectCompany(data);
        
        // Close the quick create modal
        setIsQuickCreateOpen(false);
        
        toast({
          title: "Empresa criada com sucesso!",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        title: "Erro ao criar empresa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCompanyDisplayName = (company: any) => {
    return company?.fantasy_name || company?.name || "Empresa sem nome";
  };

  const triggerElement = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "w-full justify-between font-normal",
        !value && "text-muted-foreground",
        internalError && "border-red-500",
        className
      )}
    >
      <div className="flex items-center">
        <Building className="mr-2 h-4 w-4" />
        {selectedCompany ? (
          <span className="truncate">{getCompanyDisplayName(selectedCompany)}</span>
        ) : (
          <span className="text-muted-foreground">Selecione uma empresa</span>
        )}
      </div>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const renderContent = () => (
    <div>
      <Command>
        <CommandInput 
          placeholder="Buscar empresas..." 
          onValueChange={handleSearch} 
        />
        <CommandList className="max-h-[300px]">
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando...
              </div>
            ) : searching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Buscando...
              </div>
            ) : (
              <div className="py-6 text-center">
                <Building className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-2">Nenhuma empresa encontrada</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mx-auto"
                  onClick={() => setIsQuickCreateOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Cadastrar nova
                </Button>
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="overflow-visible">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                className="flex items-center cursor-pointer"
                onSelect={() => handleSelectCompany(company)}
              >
                <div className="flex items-center w-full">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      company.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium">{getCompanyDisplayName(company)}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      CNPJ: {company.cnpj} {company.cnae && `• CNAE: ${company.cnae}`}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );

  return (
    <>
      <div className="flex gap-2 items-center w-full">
        {showTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    {triggerElement}
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 z-[100]">
                    {renderContent()}
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {disabled ? "Seleção de empresa desabilitada" : companiesTooltip}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              {triggerElement}
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 z-[100]">
              {renderContent()}
            </PopoverContent>
          </Popover>
        )}

        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          title="Adicionar nova empresa"
          disabled={disabled}
          onClick={() => setIsQuickCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {internalError && (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {internalError}
        </div>
      )}

      <CompanyQuickCreateModal
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        onSuccess={handleQuickCreateSuccess}
      />
    </>
  );
}
