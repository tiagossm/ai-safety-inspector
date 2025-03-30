import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ClipboardCheck, Clock, Calendar, Info, AlertCircle } from "lucide-react";
import { ChecklistItem } from "@/types/checklist";
import { Json } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ChecklistResponseItem } from "@/components/checklists/ChecklistResponseItem";
import { ptBR } from "date-fns/locale";
import { ChecklistActions } from "@/components/checklists/ChecklistActions";

export default function ChecklistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<any>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);

  useEffect(() => {
    const fetchChecklistData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const { data: checklistData, error: checklistError } = await supabase
          .from('checklists')
          .select('*')
          .eq('id', id)
          .single();

        if (checklistError) throw checklistError;
        setChecklist(checklistData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('checklist_itens')
          .select('*')
          .eq('checklist_id', id)
          .order('ordem', { ascending: true });

        if (itemsError) throw itemsError;
        
        const transformedItems: ChecklistItem[] = itemsData.map(item => ({
          id: item.id,
          checklist_id: item.checklist_id,
          pergunta: item.pergunta,
          tipo_resposta: item.tipo_resposta,
          obrigatorio: item.obrigatorio,
          opcoes: Array.isArray(item.opcoes) 
            ? item.opcoes.map(option => String(option)) 
            : null,
          ordem: item.ordem,
          resposta: null,
          permite_audio: !!item.permite_audio,
          permite_video: !!item.permite_video,
          permite_foto: !!item.permite_foto,
          hint: item.hint || null,
          weight: item.weight || 1,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setItems(transformedItems);

        if (checklistData.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', checklistData.company_id)
            .single();
          
          setCompany(companyData);
        }

        if (checklistData.responsible_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', checklistData.responsible_id)
            .single();
          
          setResponsible(userData);
        }
      } catch (error) {
        console.error('Error fetching checklist:', error);
        toast.error('Erro ao carregar checklist');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklistData();
  }, [id]);

  const handleResponseChange = (itemId: string, value: string | number | boolean) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, resposta: value } : item
      )
    );
  };

  const handleSaveResponses = async () => {
    if (!id) return;
    
    const unansweredRequired = items.filter(item => 
      item.obrigatorio && (item.resposta === null || item.resposta === undefined || item.resposta.toString().trim() === '')
    );
    
    if (unansweredRequired.length > 0) {
      toast.error(`Existem ${unansweredRequired.length} perguntas obrigatórias não respondidas.`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      const responsePromises = [];
      
      for (const item of items) {
        console.log(`Saving response for item ${item.id}:`, item.resposta);
        
        try {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user && item.resposta !== null && item.resposta !== undefined) {
            const commentData = {
              checklist_item_id: item.id,
              user_id: userData.user.id,
              content: `Resposta: ${item.resposta}`
            };
            
            responsePromises.push(
              supabase.from('checklist_item_comments').insert(commentData)
            );
          }
        } catch (error) {
          console.error(`Error adding response comment for item ${item.id}:`, error);
        }
      }
      
      await Promise.all(responsePromises);
      
      try {
        const { error: updateError } = await supabase
          .from('checklists')
          .update({ 
            status: 'concluido' 
          })
          .eq('id', id);
          
        if (updateError) {
          console.error("Error updating checklist status:", updateError);
          console.log("Skipping status update due to constraint error");
        }
      } catch (error) {
        console.error("Error updating checklist:", error);
      }
      
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('checklist_history').insert({
            checklist_id: id,
            user_id: userData.user.id,
            action: 'complete',
            details: 'Preencheu o checklist'
          });
        }
      } catch (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
      }
      
      toast.success('Checklist preenchido com sucesso!');
    } catch (error) {
      console.error('Error saving responses:', error);
      toast.error('Erro ao salvar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando checklist...</div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-red-500">Checklist não encontrado.</div>
        <Button onClick={() => navigate('/checklists')}>Voltar para a lista</Button>
      </div>
    );
  }

  const totalItems = items.length;
  const answeredItems = items.filter(item => item.resposta !== null && item.resposta !== undefined).length;
  const progress = totalItems > 0 ? (answeredItems / totalItems) * 100 : 0;
  const score = totalItems > 0 
    ? items.reduce((acc, item) => {
        if (item.resposta === "sim" || item.resposta === "bom") {
          return acc + (item.weight || 1);
        }
        return acc;
      }, 0) 
    : 0;
  const maxScore = items.reduce((acc, item) => acc + (item.weight || 1), 0);
  const scorePercentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/checklists')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{checklist.title}</h1>
          </div>
          <ChecklistActions checklist={checklist} />
        </div>
        
        <Card className={`bg-gradient-to-r ${progress >= 70 ? 'from-green-500/20 to-green-400/10' : progress >= 30 ? 'from-amber-500/20 to-amber-400/10' : 'from-red-500/20 to-red-400/10'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {checklist.description || "Inspeção"}
            </CardTitle>
            <CardDescription>
              Criado em {format(new Date(checklist.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{answeredItems} de {totalItems} ({Math.round(progress)}%)</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Pontuação</span>
                  <span>{score} de {maxScore} ({Math.round(scorePercentage)}%)</span>
                </div>
                <Progress value={scorePercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <ChecklistResponseItem
                  key={item.id}
                  item={item}
                  onResponseChange={handleResponseChange}
                  index={index}
                />
              ))}
            </div>
            
            <Card>
              <CardFooter className="p-4">
                <Button 
                  onClick={handleSaveResponses} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Salvando...' : 'Salvar Respostas'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${checklist.status === 'concluido' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    {checklist.status === 'concluido' ? 'Concluído' : 'Pendente'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                  <p className="mt-1">{checklist.category || 'Geral'}</p>
                </div>
                
                {checklist.due_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Data de Vencimento</h3>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(checklist.due_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                  <p className="mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(checklist.created_at), 'dd/MM/yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {company && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{company.fantasy_name || 'Empresa sem nome'}</p>
                  {company.cnpj && (
                    <p className="text-sm text-muted-foreground mt-1">CNPJ: {company.cnpj}</p>
                  )}
                  {company.address && (
                    <p className="text-sm text-muted-foreground mt-1">{company.address}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {responsible && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Responsável</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{responsible.name}</p>
                  {responsible.email && (
                    <p className="text-sm text-muted-foreground mt-1">{responsible.email}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Dicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Itens obrigatórios estão marcados com <span className="text-red-500">*</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Clique no ícone de informação para ver instruções adicionais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>Certifique-se de completar o checklist antes da data de vencimento</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
