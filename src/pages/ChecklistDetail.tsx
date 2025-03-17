
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, ClipboardCheck, Clock, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: string;
  obrigatorio: boolean;
  ordem: number;
  resposta?: string | null;
  opcoes?: string[] | null;
}

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

        // Fetch checklist details
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklists')
          .select('*')
          .eq('id', id)
          .single();

        if (checklistError) throw checklistError;
        setChecklist(checklistData);

        // Fetch checklist items
        const { data: itemsData, error: itemsError } = await supabase
          .from('checklist_itens')
          .select('*')
          .eq('checklist_id', id)
          .order('ordem', { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData);

        // Fetch company if exists
        if (checklistData.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', checklistData.company_id)
            .single();
          
          setCompany(companyData);
        }

        // Fetch responsible if exists
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

  const handleResponseChange = (itemId: string, value: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, resposta: value } : item
      )
    );
  };

  const handleSaveResponses = async () => {
    if (!id) return;
    
    // Check if all required questions are answered
    const unansweredRequired = items.filter(item => 
      item.obrigatorio && (!item.resposta || item.resposta.trim() === '')
    );
    
    if (unansweredRequired.length > 0) {
      toast.error(`Existem ${unansweredRequired.length} perguntas obrigatórias não respondidas.`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Save answers for each question
      for (const item of items) {
        if (item.resposta) {
          const { error } = await supabase
            .from('checklist_itens')
            .update({ resposta: item.resposta })
            .eq('id', item.id);
            
          if (error) throw error;
        }
      }
      
      // Update checklist status to completed
      const { error: updateError } = await supabase
        .from('checklists')
        .update({ status: 'concluido' })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      toast.success('Checklist preenchido com sucesso!');
      
      // Add history entry
      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('checklist_history').insert({
          checklist_id: id,
          user_id: userData.user?.id,
          action: 'complete',
          details: 'Preencheu o checklist'
        });
      } catch (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
      }
      
    } catch (error) {
      console.error('Error saving responses:', error);
      toast.error('Erro ao salvar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const renderResponseInput = (item: ChecklistItem) => {
    switch (item.tipo_resposta) {
      case 'sim/não':
        return (
          <RadioGroup 
            value={item.resposta || ''} 
            onValueChange={(value) => handleResponseChange(item.id, value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id={`${item.id}-sim`} />
              <Label htmlFor={`${item.id}-sim`}>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="não" id={`${item.id}-nao`} />
              <Label htmlFor={`${item.id}-nao`}>Não</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="n/a" id={`${item.id}-na`} />
              <Label htmlFor={`${item.id}-na`}>N/A</Label>
            </div>
          </RadioGroup>
        );
        
      case 'texto':
        return (
          <Textarea
            value={item.resposta || ''}
            onChange={(e) => handleResponseChange(item.id, e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full"
          />
        );
        
      case 'numérico':
        return (
          <Input
            type="number"
            value={item.resposta || ''}
            onChange={(e) => handleResponseChange(item.id, e.target.value)}
            placeholder="Digite um valor numérico"
            className="w-full"
          />
        );
        
      case 'múltipla escolha':
        const options = item.opcoes || ['Opção 1', 'Opção 2', 'Opção 3'];
        return (
          <Select 
            value={item.resposta || ''} 
            onValueChange={(value) => handleResponseChange(item.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            value={item.resposta || ''}
            onChange={(e) => handleResponseChange(item.id, e.target.value)}
            placeholder="Digite sua resposta"
            className="w-full"
          />
        );
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

  return (
    <div className="container mx-auto py-6 space-y-6">
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
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Checklist</CardTitle>
              <CardDescription>
                {checklist.description || "Este checklist não possui uma descrição."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="mt-1">{checklist.status === 'concluido' ? 'Concluído' : 'Pendente'}</p>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                <span>Perguntas</span>
              </CardTitle>
              <CardDescription>
                Total de {items.length} {items.length === 1 ? 'pergunta' : 'perguntas'} para preencher
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((item, index) => (
                <div key={item.id} className="border-b last:border-b-0">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <h3 className="font-medium">{item.pergunta}</h3>
                      {item.obrigatorio && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                    <div className="pl-6">
                      {renderResponseInput(item)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-4">
              <div className="flex justify-end w-full">
                <Button 
                  onClick={handleSaveResponses} 
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Respostas'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{company.fantasy_name}</p>
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
          
          {checklist.is_template && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm">Este é um checklist template. Pode ser usado como base para criar novos checklists.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
