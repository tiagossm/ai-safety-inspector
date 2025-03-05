
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAssignChecklist } from "@/hooks/checklist/useAssignChecklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { toast } from "sonner";

interface AssignChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  checklistTitle: string;
  companyId?: string;
}

export function AssignChecklistDialog({
  open,
  onOpenChange,
  checklistId,
  checklistTitle,
  companyId,
}: AssignChecklistDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  const assignChecklist = useAssignChecklist();

  // Load available users - improved with useCallback and error handling
  const loadAvailableUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading available users for assignment...");
      let query = supabase
        .from("users")
        .select("id, name, email, company_id")
        .eq("status", "active")
        .order("name");
      
      // If current user is company admin, only show users from their company
      if (typedUser?.tier === "company_admin") {
        query = query.eq("company_id", typedUser.company_id);
      } 
      // If company ID is provided, filter by that company
      else if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      console.log("Users loaded successfully:", data?.length || 0, "users");
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast("Erro ao carregar usuários", {
        description: "Tente novamente mais tarde",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [typedUser, companyId]);

  // Load already assigned users
  const loadAssignedUsers = useCallback(async () => {
    if (!checklistId) return;
    
    try {
      console.log("Loading assigned users for checklist:", checklistId);
      const { data, error } = await supabase
        .from("user_checklists")
        .select("user_id")
        .eq("checklist_id", checklistId);
      
      if (error) throw error;
      
      if (data) {
        console.log("Assigned users loaded:", data.length);
        setSelectedUsers(data.map(item => item.user_id));
      }
    } catch (error) {
      console.error("Error loading assigned users:", error);
    }
  }, [checklistId]);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      setSearch("");
      loadAssignedUsers();
      loadAvailableUsers();
    }
  }, [open, loadAssignedUsers, loadAvailableUsers]);

  const handleAssign = async () => {
    if (!checklistId || selectedUsers.length === 0) return;
    
    try {
      await assignChecklist.mutateAsync({
        checklistId,
        userIds: selectedUsers,
        companyId
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning checklist:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Checklist</DialogTitle>
          <DialogDescription>
            Selecione os usuários que terão acesso ao checklist: <strong>{checklistTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="mt-2">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {search ? "Nenhum usuário encontrado" : "Nenhum usuário disponível"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                <Checkbox
                  id={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                />
                <label
                  htmlFor={user.id}
                  className="flex-grow cursor-pointer"
                >
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </label>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assignChecklist.isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={selectedUsers.length === 0 || assignChecklist.isPending}
          >
            {assignChecklist.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Atribuir {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
