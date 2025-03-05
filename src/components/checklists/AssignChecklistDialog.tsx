
import { useState, useEffect } from "react";
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

  // Load already assigned users when dialog opens
  useEffect(() => {
    if (open && checklistId) {
      loadAssignedUsers();
      loadAvailableUsers();
    }
  }, [open, checklistId]);

  const loadAssignedUsers = async () => {
    try {
      const { data } = await supabase
        .from("user_checklists")
        .select("user_id")
        .eq("checklist_id", checklistId);
      
      if (data) {
        setSelectedUsers(data.map(item => item.user_id));
      }
    } catch (error) {
      console.error("Error loading assigned users:", error);
    }
  };

  const loadAvailableUsers = async () => {
    setLoading(true);
    try {
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
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

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
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
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
              Nenhum usuário encontrado
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
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </label>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
