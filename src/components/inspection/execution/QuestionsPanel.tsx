
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionsList } from "../questions-panel/QuestionsList";
import { GroupQuestionsList } from "./GroupQuestionsList";
import { Badge } from "@/components/ui/badge";

interface QuestionsPanelProps {
  questions: any[];
  groups: any[];
  responses: Record<string, any>;
  onResponseChange: (questionId: string, data: any) => void;
  onMediaChange?: (questionId: string, mediaUrls: string[]) => void;
  onMediaUpload?: (questionId: string, file: File) => Promise<string | null>;
  isEditable: boolean;
}

export function QuestionsPanel({
  questions,
  groups,
  responses,
  onResponseChange,
  onMediaChange,
  onMediaUpload,
  isEditable
}: QuestionsPanelProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    groups && groups.length > 0 ? groups[0].id : null
  );

  // Calculate stats per group
  const calcCompletionByGroup = () => {
    const stats: Record<string, { total: number; answered: number; percentage: number }> = {};

    if (!questions || questions.length === 0) return stats;

    // Initialize stats for all groups
    groups.forEach((group) => {
      stats[group.id] = { total: 0, answered: 0, percentage: 0 };
    });

    // Count questions and responses per group
    questions.forEach((question) => {
      const groupId = question.groupId || "default";
      if (!stats[groupId]) {
        stats[groupId] = { total: 0, answered: 0, percentage: 0 };
      }

      stats[groupId].total += 1;
      if (
        responses[question.id] &&
        responses[question.id].value !== undefined &&
        responses[question.id].value !== null
      ) {
        stats[groupId].answered += 1;
      }
    });

    // Calculate percentages
    Object.keys(stats).forEach((groupId) => {
      const { total, answered } = stats[groupId];
      stats[groupId].percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    });

    return stats;
  };

  const groupStats = calcCompletionByGroup();

  // Handle response change, adapt to the format the onResponseChange expects
  const handleResponseChange = (questionId: string, data: any) => {
    onResponseChange(questionId, data);
  };

  // Get filtered questions by group ID
  const getQuestionsForGroup = (groupId: string) => {
    return questions.filter((q) => (q.groupId || "default") === groupId);
  };

  return (
    <Card className="mb-24">
      <Tabs defaultValue="grouped" className="w-full">
        <div className="p-4 border-b">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="grouped">Agrupado</TabsTrigger>
            <TabsTrigger value="flat">Todos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grouped" className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 border-r md:border-r-0">
              <h3 className="font-medium mb-4">Grupos</h3>
              <ul className="space-y-1">
                {groups.map((group) => (
                  <li key={group.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center hover:bg-muted transition-colors ${
                        activeGroupId === group.id ? "bg-muted font-medium" : ""
                      }`}
                      onClick={() => setActiveGroupId(group.id)}
                    >
                      <span className="truncate">{group.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {groupStats[group.id]?.percentage || 0}%
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 md:col-span-3">
              {activeGroupId && (
                <div className="mb-4">
                  <h2 className="text-lg font-medium">
                    {groups.find((g) => g.id === activeGroupId)?.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {groupStats[activeGroupId]?.answered || 0}/{groupStats[activeGroupId]?.total || 0} respondidas
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          (groupStats[activeGroupId]?.percentage || 0) === 100
                            ? "bg-green-100 text-green-800 border-green-200"
                            : (groupStats[activeGroupId]?.percentage || 0) > 0
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      `}
                    >
                      {groupStats[activeGroupId]?.percentage || 0}% completo
                    </Badge>
                  </div>
                </div>
              )}

              {activeGroupId && (
                <GroupQuestionsList
                  questions={getQuestionsForGroup(activeGroupId)}
                  responses={responses}
                  allQuestions={questions}
                  onResponseChange={handleResponseChange}
                  onMediaChange={onMediaChange}
                  onMediaUpload={onMediaUpload}
                  isEditable={isEditable}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flat" className="p-4">
          <h3 className="font-medium mb-4">Todas as Perguntas</h3>
          <QuestionsList
            questions={questions}
            responses={responses}
            allQuestions={questions}
            onResponseChange={handleResponseChange}
            subChecklists={{}}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
