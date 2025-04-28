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
import { toast } from "sonner";

interface ResponsibleSelectorProps {
  value: string[];  // Changed to array for multiple selections
  onSelect: (ids: string[], data: any[]) => void;
  className?: string;
  disabled?: boolean;
}

export function ResponsibleSelector({ value = [], onSelect, className, disabled = false }: ResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<any[]>([]);

  // Load users when component mounts or popup opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      loadRecentlyUsed();
    }
  }, [open]);

  // Update selected users when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      fetchUsersByIds(value);
    } else {
      setSelectedUsers([]);
    }
  }, [value]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .order("name", { ascending: true });

      if (error) throw error;
      
      const formattedUsers = (data || []).map(user => ({
        id: user.id,
        name: user.name || user.email || 'Usuário sem nome',
        email: user.email || '',
        position: user.position || ''
      }));
      
      setUsers(formattedUsers);

      // Map any selected user IDs to the full user objects
      if (value && value.length > 0) {
        const selected = formattedUsers?.filter(user => value.includes(user.id)) || [];
        setSelectedUsers(selected);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast("Erro ao carregar lista de usuários");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByIds = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .in("id", ids);

      if (error) throw error;
      
      const formattedUsers = (data || []).map(user => ({
        id: user.id,
        name: user.name || user.email || 'Usuário sem nome',
        email: user.email || '',
        position: user.position || ''
      }));
      
      setSelectedUsers(formattedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários por IDs:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || query.trim() === '') {
      fetchUsers();
      return;
    }
    
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, position')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      const formattedUsers = (data || []).map(user => ({
        id: user.id,
        name: user.name || user.email || 'Usuário sem nome',
        email: user.email || '',
        position: user.position || ''
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setSearching(false);
    }
  };

  const loadRecentlyUsed = () => {
    try {
      const recentUsersString = localStorage.getItem('recentlyUsedResponsibles');
      if (recentUsersString) {
        const recentUsers = JSON.parse(recentUsersString);
        setRecentlyUsed(recentUsers);
      }
    } catch (error) {
      console.error("Error loading recently used responsibles:", error);
    }
  };

  const saveToRecentlyUsed = (user: any) => {
    try {
      // Get current recent users
      const recentUsersString = localStorage.getItem('recentlyUsedResponsibles') || '[]';
      let recentUsers = JSON.parse(recentUsersString);
      
      // Remove the user if it already exists in the list
      recentUsers = recentUsers.filter((u: any) => u.id !== user.id);
      
      // Add user to the beginning of the array
      recentUsers.unshift(user);
      
      // Limit to 5 recent users
      if (recentUsers.length > 5) {
        recentUsers = recentUsers.slice(0, 5);
      }
      
      // Save back to localStorage
      localStorage.setItem('recentlyUsedResponsibles', JSON.stringify(recentUsers));
      
      // Update state
      setRecentlyUsed(recentUsers);
    } catch (error) {
      console.error("Error saving to recently used:", error);
    }
  };

  const handleSelectUser = (user: any) => {
    console.log("Toggle selecting user:", user);
    
    // Check if user is already selected
    const isSelected = selectedUsers.some(u => u.id === user.id);
    let newSelected;
    
    if (isSelected) {
      // Remove user from selection
      newSelected = selectedUsers.filter(u => u.id !== user.id);
    } else {
      // Add user to selection
      newSelected = [...selectedUsers, user];
      saveToRecentlyUsed(user);
    }
    
    setSelectedUsers(newSelected);
    const ids = newSelected.map(u => u.id);
    console.log("Selected IDs:", ids);
    onSelect(ids, newSelected);
    
    // Keep the popover open for multi-selection
  };

  const handleRemoveUser = (userId: string) => {
    const newSelected = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newSelected);
    const ids = newSelected.map(u => u.id);
    onSelect(ids, newSelected);
  };

  const handleQuickCreateSuccess = (user: any) => {
    // Add the new user to the list
    setUsers(prevUsers => [...prevUsers, user]);
    
    // Add to selected users
    const newSelected = [...selectedUsers, user];
    setSelectedUsers(newSelected);
    const ids = newSelected.map(u => u.id);
    onSelect(ids, newSelected);
    
    // Add to recently used
    saveToRecentlyUsed(user);
  };

  return (
    <>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
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
                  className
                )}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {selectedUsers.length > 0 ? (
                    <span>{selectedUsers.length} responsável(is) selecionado(s)</span>
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
                  
                  <CommandGroup heading="Todos os usuários">
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => handleSelectUser(user)}
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
