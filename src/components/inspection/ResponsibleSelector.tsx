
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronDown, User } from "lucide-react";
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

interface ResponsibleSelectorProps {
  value: string;
  onSelect: (id: string, data: any) => void;
  className?: string;
}

export function ResponsibleSelector({ value, onSelect, className }: ResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (value && !selectedUser) {
      fetchUserById(value);
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
      setUsers(data || []);

      // If we have a value but no selectedUser yet, find it in the fetched data
      if (value && !selectedUser) {
        const found = data?.find(u => u.id === value);
        if (found) {
          setSelectedUser(found);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    onSelect(user.id, user);
    setOpen(false);
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
    
    setSelectedUser(newUser);
    onSelect(newUser.id, newUser);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            {selectedUser ? (
              <span>{selectedUser.name}</span>
            ) : (
              <span className="text-muted-foreground">Selecione um responsável</span>
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
                      }
                    }}
                  >
                    Criar novo responsável
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => handleSelectUser(user)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      user.id === value ? "opacity-100" : "opacity-0"
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
  );
}
