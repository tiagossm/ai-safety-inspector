import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronDown, User, Plus, X } from "lucide-react";
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

interface ResponsibleSelectorProps {
  value: string[];  // Changed to array for multiple selections
  onSelect: (ids: string[], data: any[]) => void;
  className?: string;
}

export function ResponsibleSelector({ value = [], onSelect, className }: ResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<any[]>([]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
    loadRecentlyUsed();
  }, []);

  // Update selected users when value changes
  useEffect(() => {
    if (value.length > 0 && users.length > 0) {
      const selected = users.filter(user => value.includes(user.id));
      setSelectedUsers(selected);
    } else {
      setSelectedUsers([]);
    }
  }, [value, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .order("name", { ascending: true });

      if (error) throw error;
      setUsers(data || []);

      // Map any selected user IDs to the full user objects
      if (value.length > 0) {
        const selected = data?.filter(user => value.includes(user.id)) || [];
        setSelectedUsers(selected);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
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
    // Check if user is already selected
    if (selectedUsers.some(u => u.id === user.id)) {
      // Remove user from selection
      const newSelected = selectedUsers.filter(u => u.id !== user.id);
      setSelectedUsers(newSelected);
      onSelect(newSelected.map(u => u.id), newSelected);
    } else {
      // Add user to selection
      const newSelected = [...selectedUsers, user];
      setSelectedUsers(newSelected);
      onSelect(newSelected.map(u => u.id), newSelected);
      saveToRecentlyUsed(user);
    }
    // Keep the popover open for multi-selection
  };

  const handleRemoveUser = (userId: string) => {
    const newSelected = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newSelected);
    onSelect(newSelected.map(u => u.id), newSelected);
  };

  // Permite adicionar um responsável manualmente
  const handleCreateResponsible = (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    // Create a temporary user object with a generated ID
    const newUser = {
      id: `temp-${Date.now()}`,
      name: inputValue,
      email: "",
      isTemporary: true
    };
    
    const newSelected = [...selectedUsers, newUser];
    setSelectedUsers(newSelected);
    onSelect(newSelected.map(u => u.id), newSelected);
  };

  const handleQuickCreateSuccess = (user: any) => {
    // Add the new user to the list
    setUsers([...users, user]);
    
    // Add to selected users
    const newSelected = [...selectedUsers, user];
    setSelectedUsers(newSelected);
    onSelect(newSelected.map(u => u.id), newSelected);
    
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
                <CommandInput placeholder="Buscar responsável..." />
                <CommandList>
                  <CommandEmpty>
                    {loading ? (
                      "Carregando..."
                    ) : (
                      <div className="py-2 px-3 text-sm">
                        <p>Nenhum responsável encontrado</p>
                        <Button 
                          variant="link" 
                          className="px-0 py-1 h-auto" 
                          onClick={() => {
                            const input = document.querySelector('.cmdk-input') as HTMLInputElement;
                            if (input?.value) {
                              handleCreateResponsible(input.value);
                              setOpen(false);
                            }
                          }}
                        >
                          Criar novo responsável
                        </Button>
                      </div>
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
