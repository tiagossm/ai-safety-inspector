
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestionList } from "@/components/new-checklist/edit/ChecklistQuestionList";
import { ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  CheckCircle2,
  FileText,
  ListChecks
} from "lucide-react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { useChecklistDrafts } from "@/hooks/new-checklist/useChecklistDrafts";
import { toast } from "sonner";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

export function ChecklistWizard() {
  const {
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    handleSubmit
  } = useChecklistEditor();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { saveDraft, lastSaved } = useChecklistDrafts(undefined, {
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups
  });

  const steps: WizardStep[] = [
    {
      id: "info",
      title: "Informações Básicas",
      description: "Defina o título, descrição e categoria do checklist",
      icon: FileText,
      component: (
        <ChecklistBasicInfo
          title={title}
          description={description}
          category={category}
          isTemplate={isTemplate}
          status={status}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategory}
          onIsTemplateChange={setIsTemplate}
          onStatusChange={setStatus}
        />
      )
    },
    {
      id: "questions",
      title: "Perguntas",
      description: "Crie e organize as perguntas do checklist",
      icon: ListChecks,
      component: <ChecklistQuestionList />
    },
    {
      id: "review",
      title: "Revisão",
      description: "Revise todas as informações antes de salvar",
      icon: CheckCircle2,
      component: (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Título</dt>
                  <dd className="text-base">{title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Categoria</dt>
                  <dd className="text-base">{category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Template</dt>
                  <dd className="text-base">{isTemplate ? "Sim" : "Não"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Status</dt>
                  <dd className="text-base">{status === "active" ? "Ativo" : "Inativo"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Descrição</dt>
                  <dd className="text-base">{description || "Nenhuma descrição fornecida"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Perguntas ({questions.length})</h3>
              <div className="max-h-[400px] overflow-y-auto">
                <ol className="space-y-4 list-decimal list-inside">
                  {questions.slice(0, 10).map((question, index) => (
                    <li key={question.id} className="text-sm">
                      <span className="font-medium">{question.text || "(Pergunta sem texto)"}</span>
                      <div className="text-xs text-muted-foreground ml-6 mt-1">
                        Tipo: {question.responseType} • 
                        {question.isRequired ? " Obrigatória" : " Opcional"}
                      </div>
                    </li>
                  ))}
                  {questions.length > 10 && (
                    <li className="text-muted-foreground text-sm">
                      E mais {questions.length - 10} perguntas...
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];
  
  const currentStep = steps[currentStepIndex];
  
  const handleNext = () => {
    if (currentStepIndex === 0 && !title) {
      toast.error("O título é obrigatório para continuar.");
      return;
    }
    
    if (currentStepIndex < steps.length - 1) {
      saveDraft({
        title,
        description,
        category,
        isTemplate,
        status,
        questions,
        groups
      });
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleSaveAndFinish = async () => {
    const success = await handleSubmit();
    if (success) {
      toast.success("Checklist salvo com sucesso!");
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex justify-between items-center">
        <div className="hidden sm:block w-1/4">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
        
        <div className="flex justify-center w-full sm:w-1/2">
          <ol className="flex items-center w-full max-w-md">
            {steps.map((step, index) => (
              <li 
                key={step.id} 
                className={`flex items-center ${
                  index === steps.length - 1 ? "" : "w-full"
                }`}
                aria-current={index === currentStepIndex ? "step" : undefined}
              >
                <div className="flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index === currentStepIndex 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : index < currentStepIndex
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-background border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    index === currentStepIndex ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}></div>
                )}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="hidden sm:block w-1/4 text-right">
          {lastSaved && (
            <p className="text-xs text-muted-foreground">
              Rascunho salvo: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Step content */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-1 flex items-center">
          <currentStep.icon className="mr-2 h-5 w-5" />
          {currentStep.title}
        </h2>
        <p className="text-muted-foreground mb-6">{currentStep.description}</p>
        
        {currentStep.component}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <div>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="sm:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Avançar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSaveAndFinish}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Checklist
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
