
import React from "react";
import { useParams } from "react-router-dom";
import { useSimpleInspection } from "@/hooks/inspection/useSimpleInspection";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { DateTimePicker } from "@/components/inspection/DateTimePicker";

export default function SimpleInspectionPage() {
  const { id } = useParams<{ id: string }>();
  
  const {
    loading,
    error,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    currentGroupId,
    setCurrentGroupId,
    filteredQuestions,
    stats,
    handleResponseChange,
    saveInspection,
    refreshData
  } = useSimpleInspection(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <h2 className="mt-4 text-xl font-medium">Carregando inspeção...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Erro ao carregar inspeção</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-red-600">
              Não foi possível carregar os dados da inspeção. Tente novamente mais tarde.
            </p>
            <Button 
              variant="outline" 
              onClick={() => refreshData()}
              className="mr-2"
            >
              Tentar novamente
            </Button>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">{inspection?.title || "Inspeção"}</h1>
          <p className="text-muted-foreground">
            {company?.fantasy_name ? `${company.fantasy_name}` : "Sem empresa selecionada"} • 
            {inspection?.status === "completed" ? " Concluída" : " Em andamento"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={saveInspection}
            className="flex items-center"
          >
            <Save className="h-4 w-4 mr-2" /> 
            Salvar progresso
          </Button>
        </div>
      </div>
      
      {/* Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Informações da Inspeção</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Empresa</label>
            <p>{company?.fantasy_name || "Não definido"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Responsável</label>
            <p>{responsible?.name || "Não definido"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Data Agendada</label>
            <p>
              {inspection?.scheduledDate ? 
                new Date(inspection.scheduledDate).toLocaleDateString('pt-BR') : 
                "Não agendada"}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats.answeredQuestions} de {stats.totalQuestions} perguntas</span>
                  <span>{stats.completionPercentage}% completo</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{width: `${stats.completionPercentage}%`}}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Seções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {groups.map(group => (
                  <Button
                    key={group.id}
                    variant={currentGroupId === group.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setCurrentGroupId(group.id)}
                  >
                    {group.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {groups.find(g => g.id === currentGroupId)?.title || "Perguntas"}
              </CardTitle>
              <CardDescription>
                {filteredQuestions.length} {filteredQuestions.length === 1 ? 'pergunta' : 'perguntas'} nesta seção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length > 0 ? (
                <div className="space-y-5">
                  {filteredQuestions.map((question, index) => (
                    <div key={question.id} className="border p-4 rounded-md">
                      <div className="flex">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.text}</p>
                          
                          {question.responseType === "yes_no" && (
                            <div className="flex space-x-2">
                              <Button 
                                variant={responses[question.id]?.value === true ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleResponseChange(question.id, { value: true })}
                              >
                                Sim
                              </Button>
                              <Button 
                                variant={responses[question.id]?.value === false ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleResponseChange(question.id, { value: false })}
                              >
                                Não
                              </Button>
                            </div>
                          )}
                          
                          {question.responseType === "text" && (
                            <textarea 
                              className="w-full border rounded p-2 h-24"
                              value={responses[question.id]?.value || ""}
                              onChange={(e) => handleResponseChange(question.id, { value: e.target.value })}
                              placeholder="Digite sua resposta..."
                            />
                          )}
                          
                          {question.responseType === "multiple_choice" && question.options && (
                            <div className="space-y-1">
                              {Array.isArray(question.options) ? question.options.map((option, i) => (
                                <Button 
                                  key={i}
                                  variant={responses[question.id]?.value === option ? "default" : "outline"}
                                  size="sm"
                                  className="mr-2 mb-2"
                                  onClick={() => handleResponseChange(question.id, { value: option })}
                                >
                                  {option}
                                </Button>
                              )) : (
                                <p className="text-red-500 text-sm">Erro nas opções</p>
                              )}
                            </div>
                          )}
                          
                          {/* Comentários */}
                          <div className="mt-3 pt-3 border-t">
                            <label className="text-sm font-medium">Comentários:</label>
                            <textarea 
                              className="w-full border rounded p-2 mt-1 h-16 text-sm"
                              value={responses[question.id]?.comment || ""}
                              onChange={(e) => handleResponseChange(
                                question.id, 
                                { ...responses[question.id] || {}, comment: e.target.value }
                              )}
                              placeholder="Adicione comentários adicionais..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Nenhuma pergunta disponível nesta seção.</p>
                  {questions.length > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecione outra seção ou verifique se o checklist contém perguntas.
                    </p>
                  )}
                  {questions.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Este checklist não contém perguntas. Verifique se o checklist foi configurado corretamente.
                    </p>
                  )}
                </div>
              )}
              
              {/* Debugging info */}
              <details className="mt-8 border-t pt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer">Informações de debug</summary>
                <div className="mt-2 text-xs overflow-auto bg-gray-50 p-2 rounded">
                  <p>Inspection ID: {id}</p>
                  <p>Checklist ID: {inspection?.checklistId}</p>
                  <p>Total questions: {questions.length}</p>
                  <p>Current group: {currentGroupId}</p>
                  <p>Filtered questions: {filteredQuestions.length}</p>
                  <p>Groups count: {groups.length}</p>
                  <p>Groups: {groups.map(g => g.title).join(', ')}</p>
                  <p>Questions per group: {
                    Object.entries(questions.reduce((acc, q) => {
                      const groupId = q.groupId || 'undefined';
                      acc[groupId] = (acc[groupId] || 0) + 1;
                      return acc;
                    }, {})).map(([k, v]) => `${k}: ${v}`).join(', ')
                  }</p>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          onClick={() => toast.success("Finalização da inspeção será implementada em breve")}
          variant="default"
          size="lg"
        >
          Finalizar Inspeção
        </Button>
      </div>
    </div>
  );
}
