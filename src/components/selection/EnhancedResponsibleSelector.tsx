
import { useState } from "react";
import { Check, ChevronDown, User, Plus, X, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ResponsibleQuickCreateModal } from "../inspection/ResponsibleQuickCreateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useResponsibleSelectionStore } from "@/hooks/selection/useResponsibleSelectionStore";
import { ResponsibleSearchResult } from "@/services/responsible/responsibleSelectionService";

export interface SelectOption {
  label: string;
  value: string;
}

interface EnhancedResponsibleSelectorProps {
  value: SelectOption[];
  onSelect: (options: SelectOption[]) => void;
  className?: string;
  disabled?: boolean;
  showTooltip?: boolean;
  error?: string;
}

export function EnhancedResponsibleSelector({ 
  value = [], 
  onSelect, 
  className, 
  disabled = false,
  showTooltip = false,
  error
}: EnhancedResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  
  // Use our responsible selection store
  const { 
    responsibles,
    selectedResponsibles,
    loadingResponsibles,
    recentlyUsed,
    searchResponsibles,
    toggleResponsibleSelection,
    removeResponsible,
    setSelectedResponsibleIds,
    createResponsible
  } = useResponsibleSelectionStore(value.map(v => v.value));

  // Keep internal store and props in sync
  useState(() => {
    if (value && value.length > 0) {
      // Extract just the IDs from the SelectOption array
      const ids = value.map(option => option.value);
      setSelectedResponsibleIds(ids);
    }
  });

  const handleSearch = async (query: string) => {
    try {
      setSearching(true);
      await searchResponsibles(query);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: ResponsibleSearchResult) => {
    toggleResponsibleSelection(user);
    
    // Prepare the updated selection options
    let updatedOptions: SelectOption[];
    
    // If user is already selected, remove it from the selection
    if (value.some(v => v.value === user.id)) {
      updatedOptions = value.filter(v => v.value !== user.id);
    } else {
      // Add the new option
      const newOption: SelectOption = {
        label: user.name || user.email || "Responsável",
        value: user.id
      };
      updatedOptions = [...value, newOption];
    }
    
    // Send the updated options back to the parent
    onSelect(updatedOptions);
  };

  const handleRemoveUser = (userId: string) => {
    removeResponsible(userId);
    
    // Remove the option from the value array
    const updatedOptions = value.filter(v => v.value !== userId);
    onSelect(updatedOptions);
  };

  const handleQuickCreateSuccess = async (userData: any) => {
    const newResponsible = await createResponsible({
      name: userData.name,
      email: userData.email,
      position: userData.position
    });
    
    if (newResponsible) {
      // Create a new selection option
      const newOption: SelectOption = {
        label: newResponsible.name || newResponsible.email || "Responsável",
        value: newResponsible.id
      };
      
      // Add to the current selections
      onSelect([...value, newOption]);
    }
  };

  const tooltipText = disabled 
    ? "Seleção de responsável desabilitada" 
    : responsibles.length === 0 
      ? "Nenhum responsável disponível" 
      : "Selecione responsáveis";

  return (
    <>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          {showTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                          "w-full justify-between font-normal",
                          (!value || value.length === 0) && "text-muted-foreground",
                          internalError && "border-red-500",
                          className
                        )}
                      >
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {selectedResponsibles.length > 0 ? (
                            <span>{selectedResponsibles.length} responsável(is) selecionado(s)</span>
                          ) : (
                            <span className="text-muted-foreground">Selecione responsáveis</span>
                          )}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 z-50">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar responsável..." 
                          onValueChange={handleSearch}
                        />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>
                            {loadingResponsibles ? (
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
                              "Nenhum responsável encontrado"
                            )}
                          </CommandEmpty>

                          {recentlyUsed.length > 0 && (
                            <CommandGroup heading="Recentes" className="overflow-visible">
                              {recentlyUsed.map((user) => (
                                <CommandItem
                                  key={`recent-${user.id}`}
                                  value={`recent-${user.name}`}
                                  className="cursor-pointer text-foreground"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectUser(user);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedResponsibles.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1 overflow-hidden">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {user.email} {user.position && `• ${user.position}`}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          
                          <CommandGroup heading="Todos os usuários" className="overflow-visible">
                            {responsibles.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.name}
                                className="cursor-pointer text-foreground"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectUser(user);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedResponsibles.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1 overflow-hidden">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {user.email} {user.position && `• ${user.position}`}
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
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between font-normal",
                    (!value || value.length === 0) && "text-muted-foreground",
                    internalError && "border-red-500",
                    className
                  )}
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {selectedResponsibles.length > 0 ? (
                      <span>{selectedResponsibles.length} responsável(is) selecionado(s)</span>
                    ) : (
                      <span className="text-muted-foreground">Selecione responsáveis</span>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0 z-50">
                <Command>
                  <CommandInput 
                    placeholder="Buscar responsável..." 
                    onValueChange={handleSearch}
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {loadingResponsibles ? (
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
                        "Nenhum responsável encontrado"
                      )}
                    </CommandEmpty>

                    {recentlyUsed.length > 0 && (
                      <CommandGroup heading="Recentes" className="overflow-visible">
                        {recentlyUsed.map((user) => (
                          <CommandItem
                            key={`recent-${user.id}`}
                            value={`recent-${user.name}`}
                            className="cursor-pointer text-foreground"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectUser(user);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedResponsibles.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 overflow-hidden">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {user.email} {user.position && `• ${user.position}`}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    
                    <CommandGroup heading="Todos os usuários" className="overflow-visible">
                      {responsibles.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          className="cursor-pointer text-foreground"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectUser(user);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedResponsibles.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email} {user.position && `• ${user.position}`}
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
        </div>

        <Button 
          type="button" 
          size="icon" 
          variant="outline" 
          title="Adicionar novo responsável"
          disabled={disabled}
          onClick={() => setIsQuickCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Display selected users */}
      {selectedResponsibles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedResponsibles.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center">
              {user.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => handleRemoveUser(user.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {internalError && (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <X className="h-3 w-3 mr-1" />
          {internalError}
        </div>
      )}

      <ResponsibleQuickCreateModal
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        onSuccess={handleQuickCreateSuccess}
      />
    </>
  );
}
