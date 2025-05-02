
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

interface CompanySelectorProps {
  value: string;
  onSelect: (id: string, data?: any) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  showTooltip?: boolean;
}

const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [companiesTooltip, setCompaniesTooltip] = useState<string>("Selecione uma empresa");

  useEffect(() => {
    if (open) {
      fetchCompanyList();
    }
  }, [open]);

  useEffect(() => {
    if (value && isValidUUID(value)) {
      fetchCompanyById(value);
    }
  }, [value]);

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

  const fetchCompanyList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address, status")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });

      if (error) throw error;

      setCompanies(data || []);

      if (value && !selectedCompany) {
        const found = data?.find(c => c.id === value);
        if (found) {
          setSelectedCompany(found);
          setInternalError(undefined);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar lista de empresas");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyById = async (id: string) => {
    if (!isValidUUID(id)) {
      console.error("Invalid UUID when fetching company by ID:", id);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address, status")
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const company = {
          id: data.id,
          name: data.fantasy_name || "Empresa sem nome",
          fantasy_name: data.fantasy_name || "Empresa sem nome",
          cnpj: data.cnpj || "",
          cnae: data.cnae || "",
          address: data.address || "",
        };
        setSelectedCompany(company);
        setInternalError(undefined);
      } else {
        console.warn("Company not found or inactive:", id);
        setInternalError("Empresa não encontrada ou inativa");
      }
    } catch (error) {
      console.error("Erro ao buscar empresa por ID:", error);
      setInternalError("Erro ao buscar detalhes da empresa");
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address, status")
        .ilike("fantasy_name", `%${query}%`)
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });

      if (error) throw error;

      setCompanies(data || []);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCompany = (company: any) => {
    if (!company?.id || !isValidUUID(company.id)) {
      console.error("Invalid company data selected:", company);
      return;
    }

    setSelectedCompany(company);
    setInternalError(undefined);
    onSelect(company.id, company);
    setOpen(false);
  };

  const handleQuickCreateSuccess = (company: any) => {
    if (company?.id && isValidUUID(company.id)) {
      setCompanies([...companies, company]);
      handleSelectCompany(company);
    } else {
      console.error("Invalid company data after creation:", company);
    }
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
          <span className="truncate">{selectedCompany.name || selectedCompany.fantasy_name}</span>
        ) : (
          <span className="text-muted-foreground">Selecione uma empresa</span>
        )}
      </div>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <>
      <div className="flex gap-2 items-center w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    {triggerElement}
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 z-[100]">
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
                            "Nenhuma empresa encontrada"
                          )}
                        </CommandEmpty>
                        <CommandGroup className="overflow-visible">
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.fantasy_name || company.name || ""}
                              className="cursor-pointer text-foreground"
                              onSelect={() => handleSelectCompany(company)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  company.id === value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{company.fantasy_name || company.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  CNPJ: {company.cnpj} {company.cnae && `• CNAE: ${company.cnae}`}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {disabled ? "Seleção de empresa desabilitada" : companiesTooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
