
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import { 
  FileCheck, 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowLeft 
} from "lucide-react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { StandardResponseType } from "@/types/responseTypes";
import { AIModeContent } from "@/components/new-checklist/create/AIModeContent";

type CreationMode = "manual" | "ai" | "csv" | null;

interface GroupedQuestions {
  groupTitle: string;
  questions: any[];
}

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<CreationMode>(null);

  const handleModeSelect = (mode: CreationMode) => {
    setSelectedMode(mode);
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
    } else {
      navigate("/new-checklists");
    }
  };

  const handleChecklistCreated = (checklistData: any) => {
    console.log("Checklist criado:", checklistData);
    navigate("/new-checklists");
  };

  const handleQuestionsGenerated = (questions: ChecklistQuestion[]) => {
    const defaultQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: 0,
      groupId: "default",
      level: 0,
      path: `new-${Date.now()}`,
      isConditional: false,
      options: []
    };

    const defaultGroup: ChecklistGroup = {
      id: "default", 
      title: "Geral",
      order: 0
    };

    const questionsWithGroupId = questions.map(q => ({
      ...q,
      groupId: "default",
      options: q.options || []
    }));

    const sessionData = {
      checklistData: {
        title: "Checklist Gerado por IA",
        description: "Checklist criado automaticamente com inteligência artificial",
        category: "Geral",
        status: "active",
        isTemplate: false
      },
      questions: questionsWithGroupId,
      groups: [defaultGroup],
      mode: "ai"
    };

    sessionStorage.setItem("checklistEditorData", JSON.stringify(sessionData));
    navigate("/new-checklists/editor");
  };

  const handleCSVImported = (groupedQuestions: GroupedQuestions[]) => {
    const groups: ChecklistGroup[] = groupedQuestions.map((group, index) => ({
      id: `group-${index}`,
      title: group.groupTitle,
      order: index
    }));

    const questions: ChecklistQuestion[] = [];
    let questionOrder = 0;

    groupedQuestions.forEach((group, groupIndex) => {
      group.questions.forEach((q) => {
        questions.push({
          id: `question-${questionOrder}`,
          text: q.text,
          responseType: q.type as StandardResponseType,
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false,
          allowsFiles: false,
          order: questionOrder,
          options: q.options || [],
          groupId: `group-${groupIndex}`,
          level: 0,
          path: `question-${questionOrder}`,
          isConditional: false
        });
        questionOrder++;
      });
    });

    const sessionData = {
      checklistData: {
        title: "Checklist Importado",
        description: "Checklist criado a partir de importação CSV",
        category: "Importado",
        status: "active",
        isTemplate: false
      },
      questions,
      groups,
      mode: "csv"
    };

    sessionStorage.setItem("checklistEditorData", JSON.stringify(sessionData));
    navigate("/new-checklists/editor");
  };

  return (
    <div>
      {selectedMode === null ? (
        <div className="container mx-auto py-10">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Checklist</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Button className="w-full h-16 flex flex-col justify-center items-center" onClick={() => handleModeSelect("manual")}>
                <FileCheck className="h-6 w-6 mb-1" />
                Criar Manualmente
              </Button>
              <Separator />
              <Button className="w-full h-16 flex flex-col justify-center items-center" onClick={() => handleModeSelect("ai")}>
                <Sparkles className="h-6 w-6 mb-1" />
                Gerar com IA
                <Badge variant="secondary" className="ml-2">Em breve</Badge>
              </Button>
              <Separator />
              <Button className="w-full h-16 flex flex-col justify-center items-center" onClick={() => handleModeSelect("csv")}>
                <Upload className="h-6 w-6 mb-1" />
                Importar de CSV
                <Badge variant="secondary" className="ml-2">Em breve</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto py-10">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {selectedMode === "manual" && (
            <Card>
              <CardHeader>
                <CardTitle>Criar Checklist Manualmente</CardTitle>
              </CardHeader>
              <CardContent>
                <ChecklistForm onCreate={handleChecklistCreated} />
              </CardContent>
            </Card>
          )}

          {selectedMode === "ai" && (
            <AIModeContent
              onQuestionsGenerated={handleQuestionsGenerated}
              onCancel={handleBack}
            />
          )}

          {selectedMode === "csv" && (
            <Card>
              <CardHeader>
                <CardTitle>Importar Checklist de CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p>Funcionalidade de importação CSV em breve.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
