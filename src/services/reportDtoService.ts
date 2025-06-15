
import { supabase } from "@/integrations/supabase/client";
import { generateQRCode } from "./qrCodeService";
import { ReportDTO, MediaByType, MediaItem, InspectionSummary, ActionPlanItem } from "@/types/reportDto";
import { extractResponseData } from "@/utils/inspection/responseDataExtractor";

export async function generateReportDTO(inspectionId: string): Promise<ReportDTO> {
  // Buscar dados da inspeção
  const { data: inspection, error: inspectionError } = await supabase
    .from('inspections')
    .select(`
      *,
      company:company_id(fantasy_name),
      checklist:checklist_id(title, description)
    `)
    .eq('id', inspectionId)
    .single();

  if (inspectionError) {
    throw new Error(`Erro ao buscar inspeção: ${inspectionError.message}`);
  }

  // Buscar dados do responsável separadamente se necessário
  let responsibleData = null;
  if (inspection.responsible_id) {
    const { data: responsible } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', inspection.responsible_id)
      .single();
    
    responsibleData = responsible;
  }

  // Buscar respostas da inspeção com questões
  const { data: responses, error: responsesError } = await supabase
    .from('checklist_item_responses')
    .select(`
      *,
      checklist_item:checklist_item_id(pergunta, ordem, tipo_resposta)
    `)
    .eq('inspection_id', inspectionId)
    .order('checklist_item.ordem');

  if (responsesError) {
    throw new Error(`Erro ao buscar respostas: ${responsesError.message}`);
  }

  // Buscar assinaturas
  const { data: signatures } = await supabase
    .from('inspection_signatures')
    .select('*')
    .eq('inspection_id', inspectionId);

  // Processar respostas e mídias
  const processedResponses = [];
  const allMedia: MediaItem[] = [];
  let totalCompliant = 0;

  for (const response of responses || []) {
    const extractedData = extractResponseData(response);
    
    // Determinar se é conforme
    const isCompliant = determineCompliance(extractedData.value, response.checklist_item?.tipo_resposta);
    if (isCompliant) totalCompliant++;

    processedResponses.push({
      questionNumber: response.checklist_item?.ordem || 0,
      questionText: response.checklist_item?.pergunta || '',
      answer: formatAnswer(extractedData.value, response.checklist_item?.tipo_resposta),
      comments: extractedData.comment,
      isCompliant
    });

    // Processar mídias
    if (extractedData.mediaUrls.length > 0) {
      for (const mediaUrl of extractedData.mediaUrls) {
        const mediaItem = await processMediaItem(
          mediaUrl, 
          response.checklist_item?.ordem || 0,
          response.checklist_item?.pergunta || ''
        );
        allMedia.push(mediaItem);
      }
    }
  }

  // Agrupar mídias por tipo
  const mediaByType = groupMediaByType(allMedia);

  // Calcular resumo
  const summary: InspectionSummary = {
    conformityPercent: responses?.length ? Math.round((totalCompliant / responses.length) * 100) : 0,
    totalNc: responses?.length ? responses.length - totalCompliant : 0,
    totalMedia: allMedia.length,
    totalQuestions: responses?.length || 0,
    completedQuestions: responses?.length || 0
  };

  // Gerar plano de ação para itens não conformes
  const actionPlan = await generateActionPlan(processedResponses.filter(r => !r.isCompliant));

  return {
    inspection: {
      id: inspection.id,
      companyName: inspection.company?.fantasy_name || 'Empresa não informada',
      checklistTitle: inspection.checklist?.title || 'Checklist',
      location: inspection.location,
      scheduledDate: inspection.scheduled_date,
      createdAt: inspection.created_at,
      status: inspection.status,
      description: inspection.checklist?.description
    },
    inspector: {
      name: responsibleData?.name || 'Não informado',
      email: responsibleData?.email
    },
    summary,
    responses: processedResponses,
    actionPlan,
    mediaByType,
    signatures: {
      inspectorSignature: signatures?.[0]?.signature_data,
      companySignature: signatures?.[1]?.signature_data,
      signedAt: signatures?.[0]?.signed_at
    }
  };
}

function determineCompliance(value: any, responseType?: string): boolean {
  if (responseType === 'sim_nao' || responseType === 'sim/não') {
    return value === true || value === 'sim' || value === 'yes';
  }
  
  // Para outros tipos, considerar como conforme se há resposta
  return value !== null && value !== undefined && value !== '';
}

function formatAnswer(value: any, responseType?: string): string {
  if (value === null || value === undefined) return "Não respondida";
  
  switch (responseType) {
    case 'sim_nao':
    case 'sim/não':
      return value === true || value === 'sim' || value === 'yes' ? 'Sim' : 'Não';
    case 'data':
      if (value) {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return String(value);
        }
      }
      return String(value);
    case 'data_hora':
      if (value) {
        try {
          return new Date(value).toLocaleString('pt-BR');
        } catch {
          return String(value);
        }
      }
      return String(value);
    default:
      return String(value);
  }
}

async function processMediaItem(
  url: string, 
  questionNumber: number, 
  questionText: string
): Promise<MediaItem> {
  const fileName = url.split('/').pop() || 'arquivo';
  const mimeType = getMimeTypeFromUrl(url);
  
  // Gerar QR Code para o link da mídia
  const qrCode = await generateQRCode(url);
  
  return {
    url,
    questionNumber,
    questionText,
    fileName,
    mimeType,
    qrCode
  };
}

function getMimeTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  // Mapear extensões para mime types
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  
  return mimeMap[extension] || 'application/octet-stream';
}

function groupMediaByType(media: MediaItem[]): MediaByType {
  const groups: MediaByType = {
    photos: [],
    videos: [],
    audios: [],
    files: []
  };
  
  media.forEach(item => {
    if (item.mimeType.startsWith('image/')) {
      groups.photos.push(item);
    } else if (item.mimeType.startsWith('video/')) {
      groups.videos.push(item);
    } else if (item.mimeType.startsWith('audio/')) {
      groups.audios.push(item);
    } else {
      groups.files.push(item);
    }
  });
  
  // Ordenar por número da pergunta
  Object.values(groups).forEach(group => {
    group.sort((a, b) => a.questionNumber - b.questionNumber);
  });
  
  return groups;
}

async function generateActionPlan(nonCompliantResponses: any[]): Promise<ActionPlanItem[]> {
  return nonCompliantResponses.map((response, index) => ({
    questionNumber: response.questionNumber,
    questionText: response.questionText,
    nonConformity: `Não conformidade identificada: ${response.answer}`,
    action: response.comments || 'Implementar ações corretivas necessárias',
    responsible: 'A definir',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // 30 dias
    priority: 'medium' as const
  }));
}
