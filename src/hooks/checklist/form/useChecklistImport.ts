
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { NewChecklist } from '@/types/checklist';

type ImportResult = {
  success: boolean;
  message?: string;
  checklistData?: any;
  questions?: any[];
  groups?: any[];
  mode?: string;
};

export function useChecklistImport() {
  const [isImporting, setIsImporting] = useState(false);

  // Função para importar de arquivo
  const importFromFile = async (file: File, formData: NewChecklist): Promise<ImportResult> => {
    setIsImporting(true);

    try {
      if (!file) {
        toast.error("Selecione um arquivo para importar");
        return { success: false, message: "Nenhum arquivo selecionado" };
      }

      if (!formData.title) {
        toast.error("O título do checklist é obrigatório");
        return { success: false, message: "Título é obrigatório" };
      }

      let parsedData: any[] = [];

      // Determinar o tipo de arquivo e processar de acordo
      if (file.name.endsWith('.csv')) {
        // Processar CSV
        parsedData = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Processar Excel
        parsedData = await parseExcel(file);
      } else {
        toast.error("Formato de arquivo não suportado. Use CSV ou Excel (.xlsx/.xls)");
        return { success: false, message: "Formato não suportado" };
      }

      if (parsedData.length === 0) {
        toast.error("Nenhum dado encontrado no arquivo");
        return { success: false, message: "Arquivo vazio" };
      }

      console.log("Dados importados:", parsedData);

      // Converter dados para o formato de perguntas e grupos
      const { questions, groups } = convertImportDataToQuestions(parsedData);

      // Se usar a API do Supabase estiver disponível, tente processar o arquivo diretamente
      if (supabase.functions) {
        try {
          // Preparar FormData para envio
          const formPayload = new FormData();
          formPayload.append('file', file);
          formPayload.append('form', JSON.stringify({
            title: formData.title,
            description: formData.description,
            is_template: formData.is_template,
            status: formData.status || 'active',
            category: formData.category,
            responsible_id: formData.responsible_id,
            company_id: formData.company_id,
            due_date: formData.due_date
          }));

          // Enviar para processamento no Edge Function
          const { data, error } = await supabase.functions.invoke('process-checklist-csv', {
            body: formPayload
          });

          if (error) {
            console.error("Erro ao processar arquivo via edge function:", error);
            // Continuar com o processamento local em caso de erro
          } else if (data && data.id) {
            toast.success(`Checklist importado com sucesso! ${data.processed_items} itens processados.`);
            return { 
              success: true, 
              message: "Checklist criado via API", 
              checklistData: { 
                ...formData,
                id: data.id 
              } 
            };
          }
        } catch (apiError) {
          console.error("Erro ao chamar a API de processamento:", apiError);
          // Continuar com o processamento local em caso de erro
        }
      }

      // Retornar dados para revisão na interface
      return {
        success: true,
        checklistData: formData,
        questions,
        groups,
        mode: "import-review"
      };
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      toast.error(`Erro ao importar: ${error.message || "Erro desconhecido"}`);
      return { success: false, message: error.message || "Erro ao importar arquivo" };
    } finally {
      setIsImporting(false);
    }
  };

  // Analisar arquivo CSV
  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn("Avisos ao analisar CSV:", results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  // Analisar arquivo Excel
  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  // Converter dados importados para o formato de perguntas
  const convertImportDataToQuestions = (data: any[]): { questions: any[], groups: any[] } => {
    const questions: any[] = [];
    const groupsMap = new Map<string, { id: string, title: string, questions: any[] }>();
    
    data.forEach((row, index) => {
      // Extrair campos básicos
      const questionText = row['Pergunta'] || row['Question'] || row['Text'] || '';
      const responseType = mapResponseType(row['Tipo'] || row['Type'] || row['ResponseType'] || 'yes_no');
      const required = mapBooleanValue(row['Obrigatório'] || row['Required'] || 'sim');
      
      // Extrair opções para múltipla escolha
      let options: string[] = [];
      const optionsText = row['Opções'] || row['Options'] || '';
      if (optionsText && responseType === 'multiple_choice') {
        options = optionsText.split(/[,;|]/).map((opt: string) => opt.trim()).filter(Boolean);
      }
      
      // Extrair grupo
      const groupName = row['Grupo'] || row['Group'] || '';
      let groupId = '';
      
      if (groupName) {
        groupId = `group-${groupName.replace(/\W+/g, '-').toLowerCase()}`;
        
        if (!groupsMap.has(groupId)) {
          groupsMap.set(groupId, {
            id: groupId,
            title: groupName,
            questions: []
          });
        }
      }
      
      // Criar objeto de pergunta
      const question = {
        id: `import-${Date.now()}-${index}`,
        text: questionText,
        responseType: responseType,
        isRequired: required,
        options: options,
        hint: row['Dica'] || row['Hint'] || '',
        weight: parseFloat(row['Peso'] || row['Weight'] || '1') || 1,
        groupId: groupId || undefined,
        parentQuestionId: undefined,
        conditionValue: undefined,
        allowsPhoto: mapBooleanValue(row['PermiteFoto'] || row['AllowsPhoto'] || 'não'),
        allowsVideo: mapBooleanValue(row['PermiteVideo'] || row['AllowsVideo'] || 'não'),
        allowsAudio: mapBooleanValue(row['PermiteAudio'] || row['AllowsAudio'] || 'não'),
        order: index
      };
      
      // Adicionar à lista de perguntas
      questions.push(question);
      
      // Adicionar ao grupo, se aplicável
      if (groupId && groupsMap.has(groupId)) {
        groupsMap.get(groupId)?.questions.push(question);
      }
    });
    
    // Converter o mapa de grupos em um array
    const groups = Array.from(groupsMap.values()).map((group, index) => ({
      ...group,
      order: index
    }));
    
    return { questions, groups };
  };

  // Mapeamento de tipo de resposta para valores internos
  const mapResponseType = (type: string): 'yes_no' | 'multiple_choice' | 'text' | 'numeric' | 'photo' | 'signature' => {
    const typeMap: Record<string, any> = {
      'sim/não': 'yes_no',
      'yes/no': 'yes_no',
      'sim/nao': 'yes_no',
      'yes_no': 'yes_no',
      'múltipla escolha': 'multiple_choice',
      'multipla escolha': 'multiple_choice',
      'multiple_choice': 'multiple_choice',
      'multiple choice': 'multiple_choice',
      'texto': 'text',
      'text': 'text',
      'numérico': 'numeric',
      'numerico': 'numeric',
      'numeric': 'numeric',
      'number': 'numeric',
      'foto': 'photo',
      'photo': 'photo',
      'assinatura': 'signature',
      'signature': 'signature'
    };
    
    return typeMap[type.toLowerCase()] || 'yes_no';
  };

  // Mapear valores de texto para booleanos
  const mapBooleanValue = (value: string): boolean => {
    const trueValues = ['sim', 'yes', 'true', '1', 's', 'y', 'verdadeiro'];
    return trueValues.includes(value.toLowerCase());
  };

  // URL para template de arquivo
  const getTemplateFileUrl = (): string => {
    // Você poderia ter um template armazenado no Storage do Supabase
    // ou fornecer um link estático para um arquivo hospedado em outro lugar
    return '/templates/checklist_template.xlsx';
  };

  return {
    isImporting,
    importFromFile,
    getTemplateFileUrl
  };
}
