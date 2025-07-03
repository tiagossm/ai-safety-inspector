
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';

// Definindo o tipo ChecklistItem localmente
interface ChecklistItem {
  id: string;
  pergunta: string;
  tipo_resposta: string;
  obrigatorio: boolean;
  checklist_id: string;
  opcoes?: any;
  ordem?: number;
  weight?: number;
  permite_foto?: boolean;
  permite_video?: boolean;
  permite_audio?: boolean;
  permite_files?: boolean;
  hint?: string;
  condition_value?: string;
  parent_item_id?: string;
  has_subchecklist?: boolean;
  sub_checklist_id?: string;
}

const ChecklistItemEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [checklistItem, setChecklistItem] = useState<ChecklistItem | null>(null);
  const [pergunta, setPergunta] = useState('');
  const [tipoResposta, setTipoResposta] = useState('');
  const [obrigatorio, setObrigatorio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChecklistItem = async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_itens')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setChecklistItem(data);
          setPergunta(data.pergunta);
          setTipoResposta(data.tipo_resposta);
          setObrigatorio(data.obrigatorio);
        }
      } catch (error) {
        console.error('Erro ao buscar item da checklist:', error);
        toast.error('Erro ao carregar item da checklist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklistItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('checklist_itens')
        .update({
          pergunta,
          tipo_resposta: tipoResposta,
          obrigatorio
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Item da checklist atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao editar item da checklist:', error);
      toast.error('Erro ao atualizar item da checklist');
    } finally {
      setIsLoading(false);
    }
  };

  const tiposResposta = [
    'sim/não',
    'numérico',
    'texto',
    'assinatura',
    'seleção múltipla',
    'yes_no',
    'multiple_choice',
    'imagem',
    'time',
    'date'
  ];

  if (isLoading && !checklistItem) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Item da Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pergunta">Descrição</Label>
            <Input
              id="pergunta"
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoResposta">Tipo de Resposta</Label>
            <Select
              value={tipoResposta}
              onValueChange={setTipoResposta}
            >
              <SelectTrigger id="tipoResposta">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposResposta.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="obrigatorio" 
              checked={obrigatorio} 
              onCheckedChange={(checked) => setObrigatorio(checked === true)}
            />
            <Label htmlFor="obrigatorio">Obrigatório</Label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChecklistItemEdit;
