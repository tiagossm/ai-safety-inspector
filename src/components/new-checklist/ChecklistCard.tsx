
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";
import { ChecklistCardActions } from "./ChecklistCardActions";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onDelete: (id: string, title: string) => void;
  onEdit: (id: string) => void;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, newStatus: "active" | "inactive") => Promise<boolean>;
}

export function ChecklistCard({
  checklist,
  onDelete,
  onEdit,
  onOpen,
  onStatusChange
}: ChecklistCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    
    try {
      const newStatus = checklist.status === "active" ? "inactive" : "active";
      const success = await onStatusChange(checklist.id, newStatus);
      if (!success) {
        console.error("Falha ao alterar status do checklist");
      }
    } finally {
      setIsToggling(false);
    }
  };
  
  const formattedDate = checklist.createdAt 
    ? format(new Date(checklist.createdAt), "dd/MM/yyyy", { locale: ptBR }) 
    : "";
  
  // Ensure origin is a valid ChecklistOrigin
  const safeOrigin = (checklist.origin || 'manual') as ChecklistOrigin;
  
  return (
    <Card 
      className={cn(
        "h-full flex flex-col transition-all hover:shadow-md cursor-pointer border border-slate-200",
        checklist.status === "inactive" && "opacity-70"
      )}
      onClick={() => onOpen(checklist.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2" title={checklist.title}>
            {checklist.title}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <ChecklistOriginBadge origin={safeOrigin} />
            {checklist.isTemplate && (
              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                Template
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {checklist.description || "Sem descrição"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="grid gap-2 text-sm">
          {checklist.companyName ? (
            <div>
              <span className="text-muted-foreground">Empresa:</span>{" "}
              <span className="font-medium">{checklist.companyName}</span>
            </div>
          ) : (
            <div>
              <span className="text-muted-foreground">Empresa:</span>{" "}
              <span className="font-medium text-gray-500 italic">Sem empresa associada</span>
            </div>
          )}
          
          {checklist.category && (
            <div>
              <span className="text-muted-foreground">Categoria:</span>{" "}
              <span className="font-medium">{checklist.category}</span>
            </div>
          )}
          
          <div>
            <span className="text-muted-foreground">Criado em:</span>{" "}
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <Badge variant={checklist.status === "active" ? "default" : "secondary"} className="mt-1">
              {checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-end border-t">
        <ChecklistCardActions 
          id={checklist.id}
          title={checklist.title}
          status={checklist.status}
          isTemplate={checklist.isTemplate || false}
          isToggling={isToggling}
          onToggleStatus={handleToggleStatus}
          onEdit={() => onEdit(checklist.id)}
          onDelete={() => onDelete(checklist.id, checklist.title)}
        />
      </CardFooter>
    </Card>
  );
}
