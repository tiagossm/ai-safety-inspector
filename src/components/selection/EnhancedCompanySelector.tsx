
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
import { CompanyQuickCreateModal } from "../inspection/CompanyQuickCreateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanySelectionStore } from "@/hooks/selection/useCompanySelectionStore";

// Define the SelectOption interface for consistency
export interface SelectOption {
  label: string;
  value: string;
}

interface EnhancedCompanySelectorProps {
  value: SelectOption | null;
  onSelect: (option: SelectOption | null, data?: any) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  showTooltip?: boolean;
}

export function EnhancedCompanySelector({ 
  value, 
  onSelect, 
  className, 
  disabled = false,
  error,
  showTooltip = false
}: EnhancedCompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [companiesTooltip, setCompaniesTooltip] = useState<string>("Selecione uma empresa");

  // Use our company selection store
  const { 
    companies,
    selectedCompany,
    loadingCompanies,
    searchCompanies,
    validateCompany,
    createCompany
  } = useCompanySelectionStore(value?.value || "");

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

  useEffect(() => {
    if (value) {
      validateCompanyId();
    }
  }, [value]);

  const validateCompanyId = async () => {
    if (!value) return;

    const validation = await validateCompany(value.value);
    if (!validation.valid) {
      setInternalError(validation.error);
    } else {
      setInternalError(undefined);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setSearching(true);
      await searchCompanies(query);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCompany = (company: any) => {
    if (!company?.id) {
      console.error("Invalid company data selected:", company);
      return;
    }

    const selectOption: SelectOption = {
      label: company.name || company.fantasy_name || "Empresa",
      value: company.id
    };

    setInternalError(undefined);
    onSelect(selectOption, company);
    setOpen(false);
  };

  const handleQuickCreateSuccess = async (companyData: any) => {
    const newCompany = await createCompany(companyData);
    if (newCompany) {
      handleSelectCompany(newCompany);
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
          <span className="truncate">{selectedCompany.name}</span>
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
        {showTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    {triggerElement}
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0 z-50">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar empresas..." 
                        onValueChange={handleSearch} 
                      />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                          {loadingCompanies ? (
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
                              value={company.name}
                              className="cursor-pointer text-foreground"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectCompany(company);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  company.id === value?.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{company.name}</div>
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
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              {triggerElement}
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0 z-50">
              <Command>
                <CommandInput 
                  placeholder="Buscar empresas..." 
                  onValueChange={handleSearch} 
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>
                    {loadingCompanies ? (
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
                        value={company.name}
                        className="cursor-pointer text-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCompany(company);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            company.id === value?.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium">{company.name}</div>
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
