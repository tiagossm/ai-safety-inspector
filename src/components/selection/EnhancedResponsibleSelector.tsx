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

interface EnhancedResponsibleSelectorProps {
  value: string[];
  onSelect: (ids: string[], data: any[]) => void;
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
  } = useResponsibleSelectionStore(value);

  // Keep internal store and props in sync
  useState(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(selectedResponsibles.map(r => r.id))) {
      setSelectedResponsibleIds(value);
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
    
    // Sync back to parent component
    const updatedIds = selectedResponsibles.map(u => u.id).includes(user.id)
      ? selectedResponsibles.map(u => u.id).filter(id => id !== user.id)
      : [...selectedResponsibles.map(u => u.id), user.id];
      
    const updatedUsers = updatedIds.map(id => 
      [...selectedResponsibles, user].find(u => u.id === id)
    ).filter(Boolean) as ResponsibleSearchResult[];
    
    onSelect(updatedIds, updatedUsers);
  };

  const handleRemoveUser = (userId: string) => {
    removeResponsible(userId);
    
    // Sync back to parent component
    const updatedIds = selectedResponsibles
      .map(u => u.id)
      .filter(id => id !== userId);
      
    const updatedUsers = selectedResponsibles
      .filter(u => u.id !== userId);
      
    onSelect(updatedIds, updatedUsers);
  };

  const handleQuickCreateSuccess = async (userData: any) => {
    const newResponsible = await createResponsible({
      name: userData.name,
      email: userData.email,
      position: userData.position
    });
    
    if (newResponsible) {
      // The store will automatically add the new responsible to the selected list
      // We just need to sync back to parent
      const updatedIds = [...selectedResponsibles.map(u => u.id), newResponsible.id];
      const updatedUsers = [...selectedResponsibles, newResponsible];
      onSelect(updatedIds, updatedUsers);
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
                    <PopoverContent className="w-[350px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar responsável..." 
                          onValueChange={handleSearch}
                        />
                        <CommandList>
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
                            <CommandGroup heading="Recentes">
                              {recentlyUsed.map((user) => (
                                <CommandItem
                                  key={`recent-${user.id}`}
                                  value={`recent-${user.name}`}
                                  onSelect={() => handleSelectUser(user)}
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
                          
                          <CommandGroup heading="Todos os usuários">
                            {responsibles.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => handleSelectUser(user)}
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
              <PopoverContent className="w-[350px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Buscar responsável..." 
                    onValueChange={handleSearch}
                  />
                  <CommandList>
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
                      <CommandGroup heading="Recentes">
                        {recentlyUsed.map((user) => (
                          <CommandItem
                            key={`recent-${user.id}`}
                            value={`recent-${user.name}`}
                            onSelect={() => handleSelectUser(user)}
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
                    
                    <CommandGroup heading="Todos os usuários">
                      {responsibles.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => handleSelectUser(user)}
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
