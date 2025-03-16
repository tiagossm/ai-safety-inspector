
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
      // If companyId is provided, filter by that company
      else if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
      console.log(`Loaded ${data?.length || 0} users for assignment`);
      
      // Also load existing assignments
      const { data: assignedUsers, error: assignmentError } = await supabase
        .from("user_checklists")
        .select("user_id")
        .eq("checklist_id", checklistId);
      
      if (assignmentError) {
        console.warn("Error loading existing assignments:", assignmentError);
      } else {
        const assignedIds = assignedUsers.map(a => a.user_id);
        setSelectedUsers(assignedIds);
        console.log(`Found ${assignedIds.length} existing assignments`);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [typedUser, companyId, checklistId]);

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    } else {
      setSearch("");
      setSelectedUsers([]);
    }
  }, [open, loadAvailableUsers]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Selecione pelo menos um usuário");
      return;
    }

    try {
      await assignChecklist.mutateAsync({
        checklistId,
        userIds: selectedUsers,
        companyId,
      });

      toast.success(
        `Checklist atribuído a ${selectedUsers.length} usuário${selectedUsers.length > 1 ? "s" : ""}`
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning checklist:", error);
      toast.error("Erro ao atribuir checklist");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Checklist</DialogTitle>
          <DialogDescription>
            Atribua o checklist "{checklistTitle}" aos usuários selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 px-1">
                <Checkbox
                  id="select-all"
                  checked={
                    filteredUsers.length > 0 &&
                    selectedUsers.length === filteredUsers.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Selecionar todos
                </label>
              </div>

              <div className="border rounded-md overflow-hidden">
                {filteredUsers.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 p-3 hover:bg-muted"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleToggleUser(user.id)}
                        />
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <label
                            htmlFor={`user-${user.id}`}
                            className="text-sm font-medium leading-none cursor-pointer truncate"
                          >
                            {user.name}
                          </label>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-muted-foreground">
                    {users.length === 0
                      ? "Nenhum usuário disponível"
                      : "Nenhum usuário encontrado para o termo buscado"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || assignChecklist.isPending}
          >
            {assignChecklist.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atribuindo...
              </>
            ) : (
              "Atribuir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
