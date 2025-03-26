
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageCircle,
  Camera,
  Info,
  List,
  CornerDownRight,
  AlertTriangle,
  Lightbulb,
  Mic,
  Video,
  Image,
  Download,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { MediaUpload } from "@/components/media/MediaUpload";

interface InspectionQuestionProps {
  question: any;
  index: number;
  response: any;
  onResponseChange: (data: any) => void;
  allQuestions: any[];
}

export function InspectionQuestion({
  question,
  index,
  response,
  onResponseChange,
  allQuestions
}: InspectionQuestionProps) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionPlanDialogOpen, setActionPlanDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [subChecklist, setSubChecklist] = useState<any>(null);
  const [subChecklistQuestions, setSubChecklistQuestions] = useState<any[]>([]);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  const [commentText, setCommentText] = useState(response?.comment || "");
  const [actionPlanText, setActionPlanText] = useState(response?.actionPlan || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  
  const handleResponseValue = (value: any) => {
    onResponseChange({
      ...(response || {}),
      value
    });
  };
  
  const handleSaveComment = () => {
    onResponseChange({
      ...(response || {}),
      comment: commentText
    });
    setCommentDialogOpen(false);
    toast.success("Comentário salvo");
  };
  
  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    toast.success("Plano de ação salvo");
  };
  
  const handleMediaUploaded = (mediaData: any) => {
    const mediaUrls = response?.mediaUrls || [];
    
    onResponseChange({
      ...(response || {}),
      mediaUrls: [...mediaUrls, mediaData.url]
    });
    
    toast.success("Mídia adicionada com sucesso");
    setMediaDialogOpen(false);
  };
  
  const loadSubChecklist = async () => {
    if (!question.subChecklistId) return;
    
    setLoadingSubChecklist(true);
    try {
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", question.subChecklistId)
        .single();
        
      if (checklistError) throw checklistError;
      
      setSubChecklist(checklistData);
      
      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", question.subChecklistId)
        .order("ordem", { ascending: true });
        
      if (questionsError) throw questionsError;
      
      setSubChecklistQuestions(questionsData.map((q: any) => ({
        id: q.id,
        text: q.pergunta,
        responseType: q.tipo_resposta,
        isRequired: q.obrigatorio,
        options: Array.isArray(q.opcoes) ? q.opcoes.map((opt: any) => String(opt)) : [],
        order: q.ordem
      })));
      
      setSubChecklistDialogOpen(true);
    } catch (error) {
      console.error("Error loading sub-checklist:", error);
      toast.error("Falha ao carregar sub-checklist");
    } finally {
      setLoadingSubChecklist(false);
    }
  };
  
  const renderYesNoOptions = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant={response?.value === "sim" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "sim" ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => handleResponseValue("sim")}
          size="sm"
        >
          <CheckCircle className="h-4 w-4" />
          <span>SIM</span>
        </Button>
        <Button
          variant={response?.value === "não" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "não" ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => handleResponseValue("não")}
          size="sm"
        >
          <XCircle className="h-4 w-4" />
          <span>NÃO</span>
        </Button>
        <Button
          variant={response?.value === "n/a" ? "default" : "outline"}
          className={`flex items-center gap-2 ${response?.value === "n/a" ? "bg-gray-500 hover:bg-gray-600" : ""}`}
          onClick={() => handleResponseValue("n/a")}
          size="sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>N/A</span>
        </Button>
      </div>
    );
  };
  
  const renderTextInput = () => {
    return (
      <div className="mt-2">
        <Textarea
          value={response?.value || ""}
          onChange={(e) => handleResponseValue(e.target.value)}
          placeholder="Digite sua resposta..."
          rows={2}
        />
      </div>
    );
  };
  
  const renderNumberInput = () => {
    return (
      <div className="mt-2">
        <Input
          type="number"
          value={response?.value || ""}
          onChange={(e) => handleResponseValue(e.target.value)}
          placeholder="Digite um valor numérico..."
        />
      </div>
    );
  };
  
  const renderMultipleChoiceOptions = () => {
    if (!question.options || question.options.length === 0) {
      return <p className="text-sm text-muted-foreground mt-2">Nenhuma opção disponível</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {question.options.map((option: string, i: number) => (
          <Button
            key={i}
            variant={response?.value === option ? "default" : "outline"}
            onClick={() => handleResponseValue(option)}
            size="sm"
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };
  
  const renderPhotoInput = () => {
    return (
      <div className="mt-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size="sm"
          onClick={() => setMediaDialogOpen(true)}
        >
          <Camera className="h-4 w-4" />
          <span>Adicionar Foto</span>
        </Button>
        
        {response?.mediaUrls && response.mediaUrls.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {response.mediaUrls.map((url: string, i: number) => (
              <div key={i} className="relative aspect-square rounded border overflow-hidden">
                <img 
                  src={url} 
                  alt={`Mídia ${i+1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderResponseInput = () => {
    const responseType = question.responseType;
    
    if (responseType === "sim/não" || responseType === "yes_no") {
      return renderYesNoOptions();
    } else if (responseType === "numérico" || responseType === "numeric") {
      return renderNumberInput();
    } else if (responseType === "texto" || responseType === "text") {
      return renderTextInput();
    } else if (responseType === "seleção múltipla" || responseType === "multiple_choice") {
      return renderMultipleChoiceOptions();
    } else if (responseType === "foto" || responseType === "photo") {
      return renderPhotoInput();
    } else {
      return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {responseType}</p>;
    }
  };
  
  const getAllowedAttachmentTypes = (): ("photo" | "video" | "audio" | "file")[] => {
    const types: ("photo" | "video" | "audio" | "file")[] = ["file"];
    
    if (question.allowsPhoto) {
      types.push("photo");
    }
    
    if (question.allowsVideo) {
      types.push("video");
    }
    
    if (question.allowsAudio) {
      types.push("audio");
    }
    
    return types;
  };
  
  const renderMediaAttachments = () => {
    if (!response?.mediaUrls || response.mediaUrls.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        <h4 className="text-sm font-medium">Anexos ({response.mediaUrls.length})</h4>
        <div className="grid grid-cols-3 gap-2">
          {response.mediaUrls.map((url: string, i: number) => {
            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
            const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i);
            const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);
            
            return (
              <div key={i} className="relative aspect-square rounded border overflow-hidden group">
                {isImage ? (
                  <img src={url} alt={`Mídia ${i+1}`} className="w-full h-full object-cover" />
                ) : isVideo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <Video className="h-8 w-8 text-gray-500" />
                    <span className="text-xs mt-1 text-gray-500">Vídeo</span>
                  </div>
                ) : isAudio ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <Mic className="h-8 w-8 text-gray-500" />
                    <span className="text-xs mt-1 text-gray-500">Áudio</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <FileText className="h-8 w-8 text-gray-500" />
                    <span className="text-xs mt-1 text-gray-500">Arquivo</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-white p-1 rounded-full shadow"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const isFollowUpQuestion = !!question.parentQuestionId;
  const parentQuestion = isFollowUpQuestion ? 
    allQuestions.find(q => q.id === question.parentQuestionId) : null;
  
  const shouldShow = !isFollowUpQuestion || 
    (parentQuestion && response && 
     response.value === question.conditionValue);
  
  if (!shouldShow) return null;
  
  const getCardClasses = () => {
    let baseClasses = "overflow-hidden border";
    
    if (!response?.value && question.isRequired) {
      return `${baseClasses} border-l-4 border-l-yellow-500`;
    }
    
    if (question.responseType === "sim/não" || question.responseType === "yes_no") {
      if (response?.value === "sim") return `${baseClasses} border-l-4 border-l-green-500`;
      if (response?.value === "não") return `${baseClasses} border-l-4 border-l-red-500`;
      return baseClasses;
    }
    
    if (response?.value) {
      return `${baseClasses} border-l-4 border-l-blue-500`;
    }
    
    return baseClasses;
  };
  
  return (
    <>
      <Card className={getCardClasses()}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              {isFollowUpQuestion && (
                <CornerDownRight className="h-4 w-4 mt-1 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{index + 1}.</span>
                  <h3 className="font-medium">{question.text}</h3>
                  {question.isRequired && (
                    <Badge variant="outline" className="text-red-500">*</Badge>
                  )}
                </div>
                
                {renderResponseInput()}
                
                {response?.comment && !showCommentSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentSection(true)}
                    className="mt-2 flex items-center gap-1 text-xs"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Mostrar Comentário</span>
                  </Button>
                )}
                
                {(showCommentSection || response?.comment) && (
                  <div className="mt-2 bg-slate-50 p-2 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-700">Comentário:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCommentSection(false)}
                        className="h-5 w-5 p-0"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">{response?.comment || "Nenhum comentário adicionado ainda."}</p>
                  </div>
                )}
                
                {question.hasSubChecklist && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSubChecklist}
                      disabled={loadingSubChecklist}
                      className="flex items-center gap-1"
                    >
                      <List className="h-4 w-4" />
                      <span>{loadingSubChecklist ? "Carregando..." : "Abrir Sub-Checklist"}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {question.hint && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mt-0"
                title="Dica da pergunta"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {(response?.value === "não" || isActionPlanOpen || response?.actionPlan) && (
            <Collapsible
              open={isActionPlanOpen || !!response?.actionPlan}
              onOpenChange={setIsActionPlanOpen}
              className="mt-3"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 w-full justify-start bg-amber-50 border-amber-200 text-amber-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>{response?.actionPlan ? "Plano de Ação" : "Adicionar Plano de Ação"}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-medium text-amber-800">Plano de Ação</h4>
                  </div>
                  <Textarea
                    value={response?.actionPlan || ""}
                    onChange={(e) => {
                      onResponseChange({
                        ...(response || {}),
                        actionPlan: e.target.value
                      });
                    }}
                    placeholder="Descreva o plano de ação para resolver este problema..."
                    rows={2}
                    className="bg-white"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex flex-wrap justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMediaDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Camera className="h-4 w-4" />
              <span>Mídia</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCommentText(response?.comment || "");
                setCommentDialogOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comentário</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (response?.value === "não") {
                  setActionPlanText(response?.actionPlan || "");
                  setActionPlanDialogOpen(true);
                } else {
                  toast.info("Planos de ação são tipicamente adicionados para respostas 'Não'");
                  setIsActionPlanOpen(true);
                }
              }}
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Plano de Ação</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Comentário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Pergunta:</Label>
              <p className="text-sm">{question.text}</p>
            </div>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicione seu comentário aqui..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCommentDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveComment}>
                Salvar Comentário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={actionPlanDialogOpen} onOpenChange={setActionPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Plano de Ação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Não-Conformidade:</Label>
              <p className="text-sm">{question.text}</p>
            </div>
            <Textarea
              value={actionPlanText}
              onChange={(e) => setActionPlanText(e.target.value)}
              placeholder="Descreva as ações necessárias para resolver este problema..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setActionPlanDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveActionPlan}>
                Salvar Plano de Ação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MediaUpload
              onMediaUploaded={handleMediaUploaded}
              className="w-full"
              allowedTypes={getAllowedAttachmentTypes()}
            />
            
            {response?.mediaUrls && response.mediaUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Mídia Atual:</h4>
                {renderMediaAttachments()}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setMediaDialogOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={subChecklistDialogOpen} onOpenChange={setSubChecklistDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{subChecklist?.title || "Sub-Checklist"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1">
            {subChecklist?.description && (
              <p className="text-muted-foreground mb-4">{subChecklist.description}</p>
            )}
            
            <div className="space-y-4">
              {subChecklistQuestions.map((subQ, idx) => (
                <Card key={subQ.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{idx + 1}.</span>
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{subQ.text}</h3>
                        
                        {subQ.responseType === "sim/não" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>SIM</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>NÃO</span>
                            </Button>
                          </div>
                        )}
                        
                        {subQ.responseType === "texto" && (
                          <Textarea 
                            placeholder="Digite sua resposta..."
                            rows={2}
                          />
                        )}
                        
                        {(subQ.responseType === "seleção múltipla" || subQ.responseType === "multiple_choice") && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {subQ.options?.map((option: string, i: number) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setSubChecklistDialogOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      {children}
    </label>
  );
}
