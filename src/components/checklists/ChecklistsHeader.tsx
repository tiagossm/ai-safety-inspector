
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateChecklistDialog } from "@/components/checklists/CreateChecklistDialog";

export function ChecklistsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Checklists</h2>
        <p className="text-muted-foreground">
          Gerencie seus modelos de inspeção e checklists
        </p>
      </div>
      <CreateChecklistDialog />
    </div>
  );
}
