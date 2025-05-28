
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ActionPlanWithRelations } from "@/types/action-plan";
import { getPriorityIcon, getStatusIcon, getStatusBadge, getPriorityBadge } from "./ActionPlanBadges";

interface ActionPlanTableProps {
  actionPlans: ActionPlanWithRelations[];
}

export function ActionPlanTable({ actionPlans }: ActionPlanTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Data Limite</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actionPlans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="max-w-md">
                <div className="flex items-start gap-2">
                  {getPriorityIcon(plan.priority)}
                  <div>
                    <span className="font-medium line-clamp-1">{plan.description}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {plan.question && 
                       typeof plan.question === 'object' && 
                       'pergunta' in plan.question && 
                       plan.question.pergunta ? 
                       plan.question.pergunta : ""}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {plan.inspection?.company?.fantasy_name || "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(plan.status)}
                  {getStatusBadge(plan.status)}
                </div>
              </TableCell>
              <TableCell>
                {getPriorityBadge(plan.priority)}
              </TableCell>
              <TableCell>
                {plan.due_date ? formatDate(plan.due_date) : "Não definida"}
              </TableCell>
              <TableCell>
                {(plan as any).assignee || "Não atribuído"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
