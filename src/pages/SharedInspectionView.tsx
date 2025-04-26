
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { EnhancedQuestionItem } from "@/components/inspection/execution/EnhancedQuestionItem";

export default function SharedInspectionView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    // Validate token exists
    if (!token) {
      setError("Token de acesso inválido ou expirado");
      setLoading(false);
      return;
    }
    
    const fetchInspection = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would verify the token and fetch the inspection
        // For now, we'll simulate a short delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data
        const mockInspection = {
          id,
          title: "Inspeção Compartilhada",
          description: "Esta é uma visualização compartilhada da inspeção",
          status: "Em Andamento",
          company: { name: "Empresa ABC" },
          location: "São Paulo, SP",
          scheduled_date: new Date().toISOString()
        };
        
        const mockQuestions = Array(5).fill(0).map((_, i) => ({
          id: `q-${i+1}`,
          text: `Pergunta de exemplo ${i+1}?`,
          tipo_resposta: i % 2 === 0 ? "yes_no" : "text",
          permite_foto: true,
          permite_video: i % 3 === 0,
          obrigatorio: i % 2 === 0
        }));
        
        setInspection(mockInspection);
        setQuestions(mockQuestions);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching shared inspection:", err);
        setError("Erro ao carregar a inspeção. O link pode ter expirado.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInspection();
  }, [id, token]);
  
  // Calculate completion stats
  const calculateStats = () => {
    if (!questions || questions.length === 0) return { percentage: 0, answered: 0, total: 0 };
    
    const total = questions.length;
    const answered = Object.keys(responses).filter(id => 
      responses[id] && responses[id].value !== undefined
    ).length;
    
    return {
      percentage: Math.round((answered / total) * 100),
      answered,
      total
    };
  };
  
  const stats = calculateStats();
  
  // Handle response change
  const handleResponseChange = (questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data
      }
    }));
  };
  
  // Handle media change
  const handleMediaChange = (questionId: string, mediaUrls: string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        mediaUrls
      }
    }));
  };
  
  // Handle media upload
  const handleMediaUpload = async (file: File): Promise<string | null> => {
    try {
      // In a real implementation, this would upload the file
      // For now, we'll create a fake URL
      const url = URL.createObjectURL(file);
      return url;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };
  
  // Submit responses
  const handleSubmit = async () => {
    setSaving(true);
    
    try {
      // In a real implementation, this would submit the responses
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Respostas enviadas com sucesso");
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast.error("Erro ao enviar respostas");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Carregando inspeção compartilhada...</p>
      </div>
    );
  }
  
  if (error || !inspection) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Link Inválido</h2>
            <p className="text-lg mb-6">{error || "Link de compartilhamento inválido ou expirado"}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{inspection.title}</h1>
          {inspection.description && (
            <p className="text-muted-foreground">{inspection.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Empresa</p>
            <p className="font-medium">{inspection.company?.name || "Não informada"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Local</p>
            <p className="font-medium">{inspection.location || "Não informado"}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progresso</span>
            <span className="text-muted-foreground">
              {stats.answered}/{stats.total} perguntas ({stats.percentage}%)
            </span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
        </div>
      </Card>
      
      <div className="space-y-4 mb-8">
        {questions.map((question, index) => (
          <Card key={question.id} className="p-4">
            <EnhancedQuestionItem
              question={question}
              response={responses[question.id] || {}}
              index={index}
              onResponseChange={(data) => handleResponseChange(question.id, data)}
              onMediaChange={(mediaUrls) => handleMediaChange(question.id, mediaUrls)}
              onMediaUpload={handleMediaUpload}
              isEditable={true}
            />
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={handleSubmit}
          disabled={saving}
          className="px-8"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Respostas"
          )}
        </Button>
      </div>
    </div>
  );
}
