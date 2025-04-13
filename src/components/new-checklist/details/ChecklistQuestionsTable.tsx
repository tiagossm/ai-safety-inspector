
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChecklistWithStats, ChecklistQuestion } from "@/types/newChecklist";

interface ChecklistQuestionsTableProps {
  questions?: ChecklistQuestion[];
}

export function ChecklistQuestionsTable({ questions = [] }: ChecklistQuestionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perguntas do Checklist</CardTitle>
        <CardDescription>Lista de perguntas incluídas neste checklist.</CardDescription>
      </CardHeader>
      <CardContent>
        {questions && questions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Ordem</TableHead>
                <TableHead>Pergunta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Obrigatório</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{question.text}</TableCell>
                  <TableCell>{question.responseType}</TableCell>
                  <TableCell className="text-right">{question.isRequired ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-4">
            <p className="text-muted-foreground">Nenhuma pergunta encontrada para este checklist.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
