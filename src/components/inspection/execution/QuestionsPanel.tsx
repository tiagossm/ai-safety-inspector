
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedQuestionItem } from "./EnhancedQuestionItem";

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
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(
    groups?.length > 0 ? groups[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get questions for the current group
  const getQuestionsForGroup = (groupId: string | null) => {
    if (!questions || questions.length === 0) return [];
    
    if (!groupId) return questions;
    
    return questions.filter(q => q.groupId === groupId || q.group_id === groupId);
  };
  
  // Filter questions by search query
  const filteredQuestions = () => {
    const groupQuestions = getQuestionsForGroup(currentGroupId);
    
    if (!searchQuery) return groupQuestions;
    
    const query = searchQuery.toLowerCase();
    return groupQuestions.filter(q => 
      (q.text?.toLowerCase().includes(query) || q.pergunta?.toLowerCase().includes(query))
    );
  };
  
  // Calculate completion percentage for a group
  const getGroupCompletionPercentage = (groupId: string) => {
    const groupQuestions = getQuestionsForGroup(groupId);
    if (!groupQuestions.length) return 0;
    
    const answered = groupQuestions.filter(q => {
      const response = responses[q.id];
      return response && response.value !== undefined && response.value !== null;
    }).length;
    
    return Math.round((answered / groupQuestions.length) * 100);
  };
  
  // Navigate to the previous or next group
  const navigateGroup = (direction: 'prev' | 'next') => {
    if (!groups || groups.length <= 1) return;
    
    const currentIndex = groups.findIndex(g => g.id === currentGroupId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : groups.length - 1;
    } else {
      newIndex = currentIndex < groups.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentGroupId(groups[newIndex].id);
  };
  
  // Handle response change for a question
  const handleResponseChange = (questionId: string, data: any) => {
    onResponseChange(questionId, data);
  };
  
  // Handle media change for a question
  const handleMediaChange = (questionId: string, mediaUrls: string[]) => {
    if (onMediaChange) {
      onMediaChange(questionId, mediaUrls);
    } else {
      onResponseChange(questionId, {
        ...(responses[questionId] || {}),
        mediaUrls
      });
    }
  };
  
  // Handle media upload for a question
  const handleMediaUpload = async (questionId: string, file: File) => {
    if (!onMediaUpload) return null;
    
    return await onMediaUpload(questionId, file);
  };
  
  const questionsToDisplay = filteredQuestions();
  
  const renderNoQuestions = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground font-medium">Nenhuma pergunta encontrada</p>
      {searchQuery && (
        <Button
          variant="link"
          onClick={() => setSearchQuery("")}
          className="mt-2"
        >
          Limpar busca
        </Button>
      )}
    </div>
  );
  
  // If there are no groups or questions at all
  if (!groups || groups.length === 0 || !questions || questions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground font-medium">Nenhuma pergunta disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Perguntas</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar perguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Tabs 
          value={currentGroupId || "default"} 
          onValueChange={setCurrentGroupId}
          className="w-full"
        >
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateGroup('prev')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <TabsList className="flex-1 h-10 overflow-x-auto no-scrollbar">
              {groups.map(group => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="flex items-center gap-2"
                >
                  <span>{group.title || group.name}</span>
                  <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {getGroupCompletionPercentage(group.id)}%
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateGroup('next')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {groups.map(group => (
            <TabsContent key={group.id} value={group.id} className="p-0 mt-0">
              {questionsToDisplay.length === 0 ? (
                renderNoQuestions()
              ) : (
                <div className="space-y-6 p-2">
                  {questionsToDisplay.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <EnhancedQuestionItem
                        question={question}
                        response={responses[question.id] || {}}
                        index={index}
                        onResponseChange={(data) => handleResponseChange(question.id, data)}
                        onMediaChange={(mediaUrls) => handleMediaChange(question.id, mediaUrls)}
                        onMediaUpload={(file) => handleMediaUpload(question.id, file)}
                        isEditable={isEditable}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}
