
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clipboard, Edit2, Trash2, Copy, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChecklistWithStats } from "@/types/newChecklist";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onDuplicate?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onDuplicate,
  onOpen
}: ChecklistCardProps) {
  // Format created date
  const formattedDate = checklist.createdAt 
    ? new Date(checklist.createdAt).toLocaleDateString() 
    : "Data desconhecida";
  
  // Calculate completion percentage
  const completionPercentage = checklist.totalQuestions 
    ? Math.round((checklist.completedQuestions || 0) / checklist.totalQuestions * 100) 
    : 0;
  
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{checklist.title}</h3>
          <div className="flex gap-1">
            {checklist.isTemplate && (
              <Badge variant="outline" className="bg-blue-50">Template</Badge>
            )}
            <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
              {checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Criado em {formattedDate}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 text-gray-600 mb-3">
          {checklist.description || "Sem descrição"}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>Categoria:</span>
            <span className="font-medium">{checklist.category || "Geral"}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Perguntas:</span>
            <span className="font-medium">{checklist.totalQuestions || 0}</span>
          </div>
          
          {checklist.totalQuestions > 0 && (
            <div className="flex justify-between text-sm">
              <span>Conclusão:</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between border-t">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(checklist.id)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(checklist.id, checklist.title)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
        
        <div className="flex gap-2">
          {onDuplicate && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDuplicate(checklist.id)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicar
            </Button>
          )}
          
          {onOpen && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onOpen(checklist.id)}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Abrir
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
