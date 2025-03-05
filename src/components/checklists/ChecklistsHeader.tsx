
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { AssignChecklistDialog } from "./AssignChecklistDialog";

export function ChecklistsHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  // Determine if user can create checklists (everyone can create for now)
  const canCreate = true;
  
  // Only super admins and company admins can bulk assign checklists
  const canBulkAssign = 
    typedUser?.tier === "super_admin" || 
    typedUser?.tier === "company_admin" ||
    typedUser?.role === "admin";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Listas de Verificação</h1>
        <p className="text-muted-foreground">
          Gerencie e organize suas listas de verificação
        </p>
      </div>
      
      <div className="flex gap-2 self-end sm:self-auto">
        {canBulkAssign && (
          <Button 
            variant="outline"
            onClick={() => setAssignDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Atribuir Checklists
          </Button>
        )}
        
        {canCreate && (
          <Button onClick={() => navigate("/checklists/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Checklist
          </Button>
        )}
      </div>
      
      {/* Bulk Assignment Dialog */}
      {canBulkAssign && (
        <AssignChecklistDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          checklistId=""
          checklistTitle="Multiple Checklists"
          companyId={typedUser?.company_id}
        />
      )}
    </div>
  );
}
