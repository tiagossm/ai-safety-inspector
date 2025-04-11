
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChecklistWithStats } from "@/types/newChecklist";

interface ChecklistDetailInfoProps {
  checklist: ChecklistWithStats;
}

export function ChecklistDetailInfo({ checklist }: ChecklistDetailInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={checklist.isTemplate ? "outline" : "default"}>
              {checklist.isTemplate ? "Template" : "Checklist"}
            </Badge>
            <Badge variant="secondary">{checklist.status}</Badge>
            {checklist.origin && (
              <Badge variant="outline" className="capitalize">
                {checklist.origin}
              </Badge>
            )}
          </div>
        </div>
        
        {checklist.description && (
          <p className="text-gray-600 mt-2">{checklist.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div>
            <p className="text-sm text-gray-500">Empresa</p>
            <p className="font-medium">{checklist.companyName || "Não definido"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Categoria</p>
            <p className="font-medium">{checklist.category || "Não definido"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Responsável</p>
            <p className="font-medium">{checklist.responsibleName || "Não definido"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{checklist.status || "Não definido"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Criado em</p>
            <p className="font-medium">{formatDate(checklist.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de vencimento</p>
            <p className="font-medium">{checklist.dueDate ? formatDate(checklist.dueDate) : "Não definido"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
