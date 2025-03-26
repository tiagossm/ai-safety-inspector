
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";

export default function NewChecklistDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error } = useChecklistById(id || "");
  
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    checklistId: "",
    checklistTitle: ""
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando checklist...</p>
        </div>
      </div>
    );
  }
  
  if (error || !checklist) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Checklist não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          Não foi possível encontrar o checklist solicitado.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/new-checklists")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Checklists
        </Button>
      </div>
    );
  }
  
  const handleDelete = () => {
    setDeleteDialog({
      open: true,
      checklistId: checklist.id,
      checklistTitle: checklist.title
    });
  };
  
  const handleEdit = () => {
    navigate(`/new-checklists/edit/${checklist.id}`);
  };

  const handleStartInspection = () => {
    navigate(`/inspections/new/${checklist.id}`);
  };
  
  const handleDuplicate = () => {
    toast.info("Funcionalidade de duplicação será implementada em breve");
  };
  
  // Process questions and organize into groups
  const processQuestions = () => {
    if (!checklist.questions || checklist.questions.length === 0) {
      return { groups: [], ungroupedQuestions: [] };
    }
    
    console.log("Processing questions:", checklist.questions.length);
    
    const questionsByGroup = new Map();
    const ungroupedQuestions = [];
    
    // First organize questions by group
    checklist.questions.forEach(question => {
      if (question.groupId) {
        if (!questionsByGroup.has(question.groupId)) {
          questionsByGroup.set(question.groupId, []);
        }
        questionsByGroup.get(question.groupId).push(question);
      } else {
        ungroupedQuestions.push(question);
      }
    });
    
    // Then create the groups array using metadata from the defined groups
    const groups = [];
    
    if (checklist.groups && checklist.groups.length > 0) {
      checklist.groups.forEach(group => {
        const questionsForGroup = questionsByGroup.get(group.id) || [];
        if (questionsForGroup.length > 0 || group.id === 'default') {
          groups.push({
            ...group,
            questions: questionsForGroup.sort((a, b) => a.order - b.order)
          });
        }
      });
    }
    
    // If there are grouped questions but no defined groups, create default groups
    questionsByGroup.forEach((questions, groupId) => {
      if (!checklist.groups || !checklist.groups.some(g => g.id === groupId)) {
        // Try to extract title from the first question's hint
        let groupTitle = `Grupo ${groups.length + 1}`;
        if (questions[0].hint) {
          try {
            const hintData = JSON.parse(questions[0].hint);
            if (hintData.groupTitle) {
              groupTitle = hintData.groupTitle;
            }
          } catch (e) {}
        }
        
        groups.push({
          id: groupId,
          title: groupTitle,
          questions: questions.sort((a, b) => a.order - b.order)
        });
      }
    });
    
    return { groups, ungroupedQuestions };
  };
  
  const { groups, ungroupedQuestions } = processQuestions();
  
  // Format dates
  const createdAt = checklist.createdAt 
    ? new Date(checklist.createdAt).toLocaleDateString("pt-BR", { 
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      })
    : "Data desconhecida";
    
  const updatedAt = checklist.updatedAt 
    ? new Date(checklist.updatedAt).toLocaleDateString("pt-BR", { 
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      })
    : "Data desconhecida";
    
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate("/new-checklists")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{checklist.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={checklist.status === "active" ? "default" : "secondary"}>
                {checklist.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              
              {checklist.isTemplate && (
                <Badge variant="outline" className="bg-blue-50">Template</Badge>
              )}
              
              {checklist.category && (
                <Badge variant="outline">{checklist.category}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Checklist Description */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold">Descrição</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {checklist.description || "Sem descrição"}
              </p>
            </CardContent>
          </Card>
          
          {/* Checklist Questions */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold">Perguntas</h2>
            </CardHeader>
            <CardContent>
              {groups.length === 0 && ungroupedQuestions.length === 0 ? (
                <p className="text-muted-foreground">Este checklist não possui perguntas.</p>
              ) : (
                <div className="space-y-6">
                  {/* Display grouped questions */}
                  {groups.map(group => (
                    <div key={group.id} className="mb-6">
                      <h3 className="text-lg font-medium mb-2 pb-1 border-b">
                        {group.title}
                      </h3>
                      
                      <div className="space-y-3 pl-2">
                        {group.questions.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Nenhuma pergunta neste grupo
                          </p>
                        ) : (
                          group.questions.map((question, index) => (
                            <div key={question.id} className="border-l-2 border-gray-200 pl-3 py-1">
                              <p className="font-medium mb-1">{index + 1}. {question.text}</p>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="font-normal">
                                  {question.responseType === "sim/não" ? "Sim/Não" :
                                   question.responseType === "seleção múltipla" ? "Múltipla escolha" :
                                   question.responseType === "texto" ? "Texto" :
                                   question.responseType === "numérico" ? "Numérico" :
                                   question.responseType === "foto" ? "Foto" : "Assinatura"}
                                </Badge>
                                
                                {question.isRequired && (
                                  <Badge variant="outline" className="bg-red-50 font-normal">Obrigatório</Badge>
                                )}
                                
                                {(question.allowsPhoto || question.allowsVideo || question.allowsAudio) && (
                                  <Badge variant="outline" className="bg-green-50 font-normal">
                                    {[
                                      question.allowsPhoto ? "Foto" : null,
                                      question.allowsVideo ? "Vídeo" : null,
                                      question.allowsAudio ? "Áudio" : null
                                    ].filter(Boolean).join(", ")}
                                  </Badge>
                                )}
                              </div>
                              
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2 pl-3 border-l border-dashed border-gray-200">
                                  <p className="text-sm font-medium mb-1">Opções:</p>
                                  <ul className="text-sm space-y-1">
                                    {question.options.map((option, idx) => (
                                      <li key={idx}>• {option}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Display ungrouped questions if any */}
                  {ungroupedQuestions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2 pb-1 border-b">
                        Perguntas Gerais
                      </h3>
                      
                      <div className="space-y-3 pl-2">
                        {ungroupedQuestions.map((question, index) => (
                          <div key={question.id} className="border-l-2 border-gray-200 pl-3 py-1">
                            <p className="font-medium mb-1">{index + 1}. {question.text}</p>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="font-normal">
                                {question.responseType === "sim/não" ? "Sim/Não" :
                                 question.responseType === "seleção múltipla" ? "Múltipla escolha" :
                                 question.responseType === "texto" ? "Texto" :
                                 question.responseType === "numérico" ? "Numérico" :
                                 question.responseType === "foto" ? "Foto" : "Assinatura"}
                              </Badge>
                              
                              {question.isRequired && (
                                <Badge variant="outline" className="bg-red-50 font-normal">Obrigatório</Badge>
                              )}
                            </div>
                            
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 pl-3 border-l border-dashed border-gray-200">
                                <p className="text-sm font-medium mb-1">Opções:</p>
                                <ul className="text-sm space-y-1">
                                  {question.options.map((option, idx) => (
                                    <li key={idx}>• {option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar - Checklist Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold">Informações</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{createdAt}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span>{updatedAt}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perguntas:</span>
                  <span>{checklist.questions ? checklist.questions.length : 0}</span>
                </div>
                
                {checklist.responsibleId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsável:</span>
                    <span>ID: {checklist.responsibleId.substring(0, 8)}...</span>
                  </div>
                )}
                
                {checklist.companyId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Empresa:</span>
                    <span>ID: {checklist.companyId.substring(0, 8)}...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">Ações</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={handleStartInspection}
                >
                  Iniciar inspeção
                </Button>
                
                <Button variant="outline" className="w-full">
                  Exportar checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <DeleteChecklistDialog
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      />
    </div>
  );
}
