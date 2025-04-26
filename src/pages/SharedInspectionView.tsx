
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useInspectionData } from "@/hooks/inspection/useInspectionData";
import { toast } from "sonner";
import { GroupQuestionsList } from "@/components/inspection/execution/GroupQuestionsList";
import { Progress } from "@/components/ui/progress";

export default function SharedInspectionView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const expires = searchParams.get('expires');
  
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Check if the link is expired
  useEffect(() => {
    if (expires) {
      const expiryTime = parseInt(expires);
      if (Date.now() > expiryTime) {
        setIsExpired(true);
      }
    }
  }, [expires]);
  
  // Get inspection data
  const {
    loading,
    error,
    inspection,
    questions,
    groups,
    responses,
    handleResponseChange,
    handleSaveInspection,
    handleMediaUpload,
    handleMediaChange,
    savingResponses
  } = useInspectionData(id);
  
  // Check if token is valid
  useEffect(() => {
    if (!token) {
      navigate('/');
      toast.error("Link de inspeção inválido");
    }
  }, [token, navigate]);
  
  // Calculate progress stats
  const calculateStats = () => {
    if (!questions || questions.length === 0) {
      return { percentage: 0, answered: 0, total: 0 };
    }
    
    const total = questions.length;
    const answered = Object.keys(responses || {}).filter(id => 
      responses[id] && responses[id].value !== undefined && responses[id].value !== null
    ).length;
    
    return {
      percentage: Math.round((answered / total) * 100),
      answered,
      total
    };
  };
  
  const stats = calculateStats();
  
  // Get grouped questions
  const getCurrentGroupQuestions = () => {
    if (!groups || !questions || groups.length === 0) {
      return questions || [];
    }
    
    const currentGroup = groups[currentGroupIndex];
    if (!currentGroup) return [];
    
    return questions.filter(q => (q.groupId || "default") === currentGroup.id);
  };
  
  // Handle next and previous group
  const handleNextGroup = () => {
    if (currentGroupIndex < (groups?.length || 0) - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle completion
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      await handleSaveInspection();
      setIsCompleted(true);
      toast.success("Respostas enviadas com sucesso!");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast.error("Erro ao enviar respostas. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If link is expired
  if (isExpired) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link Expirado</h1>
          <p className="text-muted-foreground mb-6">
            O link que você está tentando acessar expirou ou foi invalidado.
          </p>
        </div>
      </div>
    );
  }
  
  // If completion is done
  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Inspeção Concluída</h1>
          <p className="text-muted-foreground mb-6">
            Suas respostas foram registradas com sucesso. Obrigado por completar a inspeção!
          </p>
          <Button onClick={() => window.close()}>Fechar</Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Carregando inspeção...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !inspection) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao Carregar Inspeção</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Não foi possível carregar a inspeção solicitada."}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{inspection.title || "Inspeção sem título"}</h1>
        {inspection.description && (
          <p className="text-muted-foreground">{inspection.description}</p>
        )}
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progresso</span>
            <span className="font-medium">{stats.answered}/{stats.total} ({stats.percentage}%)</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
        </div>
      </div>
      
      {/* Group title if there are groups */}
      {groups && groups.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-medium">
            {groups[currentGroupIndex]?.title || "Perguntas"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Grupo {currentGroupIndex + 1} de {groups.length}
          </p>
        </div>
      )}
      
      {/* Questions */}
      <div className="mb-8">
        <GroupQuestionsList
          questions={getCurrentGroupQuestions()}
          responses={responses}
          allQuestions={questions}
          onResponseChange={handleResponseChange}
          onMediaChange={handleMediaChange}
          onMediaUpload={handleMediaUpload}
          isEditable={true}
        />
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePreviousGroup}
          disabled={currentGroupIndex === 0}
        >
          Anterior
        </Button>
        
        <div className="flex gap-2">
          {/* Only show next if not the last group */}
          {currentGroupIndex < (groups?.length || 0) - 1 && (
            <Button variant="default" onClick={handleNextGroup}>
              Próximo
            </Button>
          )}
          
          {/* Show complete button on the last group */}
          {currentGroupIndex === (groups?.length || 0) - 1 && (
            <Button 
              variant="default" 
              onClick={handleComplete}
              disabled={isSubmitting || savingResponses}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting || savingResponses ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Concluir
            </Button>
          )}
        </div>
      </div>
      
      {/* Auto-save indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Suas respostas são salvas automaticamente
        </p>
      </div>
    </div>
  );
}
