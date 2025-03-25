
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InspectionQuestion } from "@/components/inspection/InspectionQuestion";

interface QuestionsPanelProps {
  loading: boolean;
  currentGroupId: string | null;
  filteredQuestions: any[];
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  onResponseChange: (questionId: string, data: any) => void;
}

export function QuestionsPanel({ 
  loading,
  currentGroupId,
  filteredQuestions,
  questions,
  responses,
  groups,
  onResponseChange
}: QuestionsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {currentGroupId ? 
              groups.find(g => g.id === currentGroupId)?.title || "Perguntas" : 
              "Perguntas"}
          </CardTitle>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-gray-50">
              {filteredQuestions.length} Perguntas
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma pergunta nesta seção</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <InspectionQuestion
                  key={question.id}
                  question={question}
                  index={index}
                  response={responses[question.id]}
                  onResponseChange={(data) => onResponseChange(question.id, data)}
                  allQuestions={questions}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
