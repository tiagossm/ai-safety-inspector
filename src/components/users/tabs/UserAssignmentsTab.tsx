
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, ClipboardList, X } from "lucide-react";

interface UserAssignmentsTabProps {
  companies: string[];
  checklists: string[];
  onAddCompany: () => void;
  onRemoveCompany: (company: string) => void;
  onAddChecklist: () => void;
  onRemoveChecklist: (checklist: string) => void;
  disabled?: boolean;
}

export function UserAssignmentsTab({
  companies,
  checklists,
  onAddCompany,
  onRemoveCompany,
  onAddChecklist,
  onRemoveChecklist,
  disabled
}: UserAssignmentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Empresas ({companies.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCompany}
            disabled={disabled}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Adicionar Empresa
          </Button>
        </div>

        <ScrollArea className="h-[200px] rounded-md border p-4">
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {company}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveCompany(company)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Nenhuma empresa atribuída
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Checklists ({checklists.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddChecklist}
            disabled={disabled || companies.length === 0}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Adicionar Checklist
          </Button>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Primeiro, atribua empresas ao usuário para poder selecionar os checklists.
          </div>
        ) : (
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-2">
              {checklists.map((checklist) => (
                <div
                  key={checklist}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    {checklist}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveChecklist(checklist)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {checklists.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Nenhum checklist atribuído
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
