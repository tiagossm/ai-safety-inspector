
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";

export default function SharedInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const mode = searchParams.get("mode");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Load inspection data
  useEffect(() => {
    const loadData = async () => {
      if (!id || !token) {
        setError("ID da inspeção ou token não fornecidos");
        setLoading(false);
        return;
      }
      
      try {
        const data = await fetchInspectionData(id);
        if (data.error) {
          setError(data.error);
        } else {
          setInspection(data.inspection);
          setQuestions(data.questions);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar inspeção");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, token]);
  
  // In a real implementation, we would verify the token's validity server-side
  // For now, we'll just check that it exists
  if (!token) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso não autorizado</AlertTitle>
          <AlertDescription>
            Token inválido ou expirado. Solicite um novo link de compartilhamento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !inspection) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar inspeção</AlertTitle>
          <AlertDescription>
            {error || "Não foi possível carregar os dados da inspeção."}
          </AlertDescription>
        </Alert>
        
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{inspection.title || "Inspeção Compartilhada"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {inspection.description || "Inspeção compartilhada para visualização externa"}
              </p>
            </div>
            
            {mode === "edit" ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                Modo de Edição
              </div>
            ) : (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                Modo de Visualização
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Empresa</h3>
                <p className="text-sm">{inspection.companyName || "Não definido"}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Local</h3>
                <p className="text-sm">{inspection.locationName || "Não definido"}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Tipo de Inspeção</h3>
                <p className="text-sm">
                  {inspection.inspectionType === "internal" ? "Interna" :
                   inspection.inspectionType === "external" ? "Externa" :
                   inspection.inspectionType === "audit" ? "Auditoria" :
                   inspection.inspectionType === "routine" ? "Rotina" : 
                   inspection.inspectionType || "Não definido"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Data Agendada</h3>
                <p className="text-sm">
                  {inspection.scheduledDate ? 
                    new Date(inspection.scheduledDate).toLocaleString('pt-BR') : 
                    "Não definida"}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-medium mb-4">Perguntas</h2>
              
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma pergunta encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="overflow-hidden">
                      <div className="bg-muted px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{index + 1}.</span>
                          <span className="ml-2">{question.text || question.pergunta}</span>
                        </div>
                        {question.isRequired && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <CardContent className="pt-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          {mode === "edit" ? 
                            "Clique para responder (implementação completa em breve)" : 
                            "Modo somente visualização"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-center pt-4">
              <p className="text-sm text-muted-foreground italic">
                Esta é uma visualização compartilhada da inspeção. 
                Implementação completa do modo {mode === "edit" ? "de edição" : "de visualização"} será disponibilizada em breve.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
