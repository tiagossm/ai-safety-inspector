
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EnhancedQuestionItem } from "./EnhancedQuestionItem";
import { AlertCircle } from "lucide-react";

interface GroupQuestionsListProps {
  questions: any[];
  responses: Record<string, any>;
  allQuestions: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onMediaChange?: (questionId: string, mediaUrls: string[]) => void;
  onMediaUpload?: (questionId: string, file: File) => Promise<string | null>;
  isEditable: boolean;
}

export function GroupQuestionsList({
  questions,
  responses,
  allQuestions,
  onResponseChange,
  onMediaChange,
  onMediaUpload,
  isEditable
}: GroupQuestionsListProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Não há perguntas neste grupo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question.id} className="p-4 relative overflow-hidden">
          <EnhancedQuestionItem
            question={question}
            response={responses[question.id] || {}}
            index={index}
            onResponseChange={(data) => onResponseChange(question.id, data)}
            onMediaChange={onMediaChange ? (urls) => onMediaChange(question.id, urls) : undefined}
            onMediaUpload={onMediaUpload ? (file) => onMediaUpload(question.id, file) : undefined}
            isEditable={isEditable}
          />
          
          {index < questions.length - 1 && (
            <Separator className="mt-4" />
          )}
        </Card>
      ))}
    </div>
  );
}
