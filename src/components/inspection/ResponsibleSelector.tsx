
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
import { toast } from "sonner";

interface ResponsibleSelectorProps {
  value: string[];
  onSelect: (ids: string[], data: any[]) => void;
  className?: string;
  disabled?: boolean;
  showTooltip?: boolean;
  maxItems?: number;
  companyId?: string;
}

export function ResponsibleSelector({ 
  value = [], 
  onSelect, 
  className, 
  disabled = false,
  showTooltip = false,
  maxItems = -1,  // -1 = unlimited
  companyId
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
  }, [companyId]); // Re-fetch when company changes

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
        .eq("status", "active")
        .order("name", { ascending: true });

      // If companyId is provided, filter users by company
      if (companyId) {
        // First try to get users directly linked to this company
        const { data: companyUsers } = await supabase
          .from("user_companies")
          .select("user_id")
          .eq("company_id", companyId);
          
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(u => u.user_id);
          queryBuilder = queryBuilder.in("id", userIds);
        }
      }

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(30);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Only show users not already selected if maxItems is set
      const filteredData = maxItems > 0 && value.length >= maxItems
        ? [] // Don't show any more users if we've reached the limit
        : data?.filter(user => !value.includes(user.id)) || [];

      setUsers(filteredData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByIds = async (ids: string[]) => {
    if (!ids.length) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .in("id", ids);

      if (error) {
        console.error("Error fetching users by IDs:", error);
        return;
      }

      if (data) {
        setSelectedUsers(data);
        
        // Save to recently used (local storage)
        const recentUsers = JSON.parse(localStorage.getItem("recentUsers") || "[]");
        const uniqueUsers = [...data, ...recentUsers]
          .filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id))
          .slice(0, 5);
        
        localStorage.setItem("recentUsers", JSON.stringify(uniqueUsers));
        setRecentlyUsed(uniqueUsers.filter(u => !ids.includes(u.id)));
      }
    } catch (error) {
      console.error("Error fetching users by IDs:", error);
    }
  };

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
    const isAlreadySelected = selectedUsers.some(u => u.id === user.id);
    
    // If multi-select (maxItems not 1)
    if (maxItems !== 1) {
      let newSelectedUsers;
      let newIds;
      
      if (isAlreadySelected) {
        // Remove user if already selected
        newSelectedUsers = selectedUsers.filter(u => u.id !== user.id);
        newIds = newSelectedUsers.map(u => u.id);
      } else {
        // Check max limit
        if (maxItems > 0 && selectedUsers.length >= maxItems) {
          toast.error(`Máximo de ${maxItems} responsáveis permitidos`);
          return;
        }
        
        // Add user
        newSelectedUsers = [...selectedUsers, user];
        newIds = [...value, user.id];
      }

      setSelectedUsers(newSelectedUsers);
      onSelect(newIds, newSelectedUsers);
      
      // Only close the popover if we're in single-select mode
      if (maxItems === 1) {
        setOpen(false);
      }
    } else {
      // Single select mode
      setSelectedUsers([user]);
      onSelect([user.id], [user]);
      setOpen(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId);
    const newValue = value.filter(id => id !== userId);
    setSelectedUsers(newSelectedUsers);
    onSelect(newValue, newSelectedUsers);
  };

  const handleQuickCreateSuccess = async (userData: any) => {
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      
      if (!currentUserId) {
        console.error("User is not authenticated");
        return;
      }
      
      // Create the new user
      const { data, error } = await supabase
        .from("users")
        .insert({
          name: userData.name,
          email: userData.email,
          position: userData.position || null,
          status: "active"
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating user:", error);
        toast.error(`Erro ao criar responsável: ${error.message}`);
        return;
      }

      if (data) {
        // If company is specified, link the user to the company
        if (companyId) {
          await supabase
            .from("user_companies")
            .insert({
              user_id: data.id,
              company_id: companyId
            });
        }
        
        // Add the new user to the list
        setUsers(prev => [data, ...prev]);
        
        // Select the newly created user
        handleSelectUser(data);
        
        // Close the quick create modal
        setIsQuickCreateOpen(false);
        
        toast.success("Responsável criado com sucesso!");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(`Erro ao criar responsável: ${error.message}`);
    }
  };

  // Load recently used users from local storage
  useEffect(() => {
    try {
      const recentUsers = JSON.parse(localStorage.getItem("recentUsers") || "[]");
      // Filter out users that are already selected
      setRecentlyUsed(recentUsers.filter((user: any) => !value.includes(user.id)));
    } catch (error) {
      console.error("Error loading recent users:", error);
    }
  }, [value]);

  const triggerElement = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "w-full justify-between font-normal",
        (!value || value.length === 0) && "text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center">
        <User className="mr-2 h-4 w-4" />
        {selectedUsers.length > 0 ? (
          <span>{selectedUsers.length === 1 ? selectedUsers[0].name : `${selectedUsers.length} responsável(is)`}</span>
        ) : (
          <span className="text-muted-foreground">Selecione responsáveis</span>
        )}
      </div>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const renderContent = () => (
    <div>
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
              <div className="py-6 text-center">
                <User className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-2">Nenhum responsável encontrado</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mx-auto"
                  onClick={() => setIsQuickCreateOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Cadastrar novo
                </Button>
              </div>
            )}
          </CommandEmpty>

          {recentlyUsed.length > 0 && (
            <CommandGroup heading="Recentes" className="overflow-visible">
              {recentlyUsed.map((user) => (
                <CommandItem
                  key={`recent-${user.id}`}
                  className="flex items-center cursor-pointer"
                  onSelect={() => handleSelectUser(user)}
                >
                  <div className="flex items-center w-full">
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
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          <CommandGroup heading="Todos os usuários" className="overflow-visible">
            {users.map((user) => (
              <CommandItem
                key={user.id}
                className="flex items-center cursor-pointer"
                onSelect={() => handleSelectUser(user)}
              >
                <div className="flex items-center w-full">
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
      <div className="flex-1">
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
              {disabled ? "Seleção de responsável desabilitada" : userTooltip}
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
      </div>

      {/* Add button for new responsible */}
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

      {/* Display selected users */}
      {selectedUsers.length > 0 && (
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
