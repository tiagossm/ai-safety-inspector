
import React, { useState, useEffect } from "react";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResponsibleSelectorProps {
  value?: string;
  onSelect: (value: string, userData: any) => void;
}

export function ResponsibleSelector({ value, onSelect }: ResponsibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, position, role")
        .eq("status", "active")
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  // Get the currently selected user
  const selectedUser = value ? users.find(user => user.id === value) : null;

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedUser ? (
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{selectedUser.name || selectedUser.email}</span>
              {selectedUser.role && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {selectedUser.role}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Selecione um responsável</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" side="bottom" sideOffset={8} style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput 
            placeholder="Buscar responsável..." 
            className="h-9" 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p>Nenhum usuário encontrado.</p>
                <p className="mt-2 text-muted-foreground">Você pode informar um responsável externo abaixo.</p>
              </div>
            </CommandEmpty>
            
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onSelect(user.id, user);
                    setOpen(false);
                  }}
                  className="flex justify-between"
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user.name || user.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {user.position && (
                      <Badge variant="outline" className="mr-2 text-xs">
                        {user.position}
                      </Badge>
                    )}
                    {user.id === value && <Check className="h-4 w-4" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            
            <div className="border-t p-2 text-center text-sm text-muted-foreground">
              Para informar um responsável externo, feche esta caixa e preencha os campos abaixo.
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
