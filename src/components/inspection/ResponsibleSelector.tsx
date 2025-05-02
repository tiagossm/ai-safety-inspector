
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { ResponsibleQuickCreateModal } from "./ResponsibleQuickCreateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ResponsibleSelectorProps {
  value: string[];
  onSelect: (ids: string[], data: any[]) => void;
  className?: string;
  disabled?: boolean;
  showTooltip?: boolean;
  maxItems?: number;
}

export function ResponsibleSelector({ 
  value = [], 
  onSelect, 
  className, 
  disabled = false,
  showTooltip = false,
  maxItems = 1
}: ResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [userTooltip, setUserTooltip] = useState<string>("Selecione um responsável");

  // Fetch users and set tooltip
  useEffect(() => {
    fetchUsers();

    if (users.length === 0) {
      setUserTooltip("Nenhum responsável disponível");
    } else {
      setUserTooltip("Selecione um responsável");
    }
  }, []);

  // Update selected users when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      fetchUsersByIds(value);
    } else {
      setSelectedUsers([]);
    }
  }, [value]);

  // Fetch users for initial load
  const fetchUsers = async (query: string = "") => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("users")
        .select("id, name, email, position")
        .order("name", { ascending: true });

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(30);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Filter out users already selected for multi-select scenarios
      const filteredData = maxItems > 1 
        ? data?.filter(user => !value.includes(user.id)) || []
        : data || [];

      setUsers(filteredData);

      // Set recently used users (could be from local storage or most recently active)
      // For now, just use the first 5 users as "recent"
      setRecentlyUsed(filteredData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific users by their IDs
  const fetchUsersByIds = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .in("id", ids);

      if (error) {
        console.error("Error fetching users by IDs:", error);
        return;
      }

      if (data && data.length > 0) {
        setSelectedUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users by IDs:", error);
    }
  };

  // Handle search for users
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      setSearching(true);
      await fetchUsers(query);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: any) => {
    // Check if user is already selected
    const isSelected = selectedUsers.some(u => u.id === user.id);
    let newSelected;
    
    if (maxItems === 1) {
      // Single select mode
      newSelected = [user];
    } else {
      // Multi-select mode
      if (isSelected) {
        newSelected = selectedUsers.filter(u => u.id !== user.id);
      } else {
        newSelected = [...selectedUsers, user];
      }
    }
    
    setSelectedUsers(newSelected);
    const ids = newSelected.map(u => u.id);
    onSelect(ids, newSelected);
    
    // For single select, close the popover
    if (maxItems === 1) {
      setOpen(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newSelected = selectedUsers.filter(user => user.id !== userId);
    setSelectedUsers(newSelected);
    const ids = newSelected.map(user => user.id);
    onSelect(ids, newSelected);
  };

  const handleQuickCreateSuccess = async (userData: any) => {
    try {
      // Create the new user
      const { data, error } = await supabase
        .from("users")
        .insert([
          { 
            name: userData.name,
            email: userData.email,
            position: userData.position,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating user:", error);
        return;
      }

      if (data) {
        // Add the new user to the list
        setUsers(prev => [data, ...prev]);
        
        // Select the newly created user
        handleSelectUser(data);
        
        // Close the quick create modal
        setIsQuickCreateOpen(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
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
        selectedUsers.length === 0 && "text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center">
        <User className="mr-2 h-4 w-4" />
        {selectedUsers.length > 0 ? (
          <span className="truncate">
            {maxItems === 1 
              ? selectedUsers[0].name 
              : `${selectedUsers.length} responsável(is) selecionado(s)`}
          </span>
        ) : (
          <span className="text-muted-foreground">Selecione um responsável</span>
        )}
      </div>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

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
                      {triggerElement}
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0 z-50">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar responsável..." 
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
                              "Nenhum responsável encontrado"
                            )}
                          </CommandEmpty>

                          {recentlyUsed.length > 0 && (
                            <CommandGroup heading="Recentes" className="overflow-visible">
                              {recentlyUsed.map((user) => (
                                <CommandItem
                                  key={`recent-${user.id}`}
                                  className="cursor-pointer text-foreground"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectUser(user);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedUsers.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
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
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                className="cursor-pointer text-foreground"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectUser(user);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUsers.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
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
                {disabled ? "Seleção de responsável desabilitada" : userTooltip}
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
                    placeholder="Buscar responsável..." 
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
                        "Nenhum responsável encontrado"
                      )}
                    </CommandEmpty>

                    {recentlyUsed.length > 0 && (
                      <CommandGroup heading="Recentes" className="overflow-visible">
                        {recentlyUsed.map((user) => (
                          <CommandItem
                            key={`recent-${user.id}`}
                            className="cursor-pointer text-foreground"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectUser(user);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUsers.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
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
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          className="cursor-pointer text-foreground"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectUser(user);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedUsers.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
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
      {maxItems > 1 && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
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

      <ResponsibleQuickCreateModal
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        onSuccess={handleQuickCreateSuccess}
      />
    </>
  );
}
