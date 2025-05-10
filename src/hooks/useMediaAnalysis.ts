
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { determineSpecificFileType } from "@/utils/fileTypeUtils";

export interface MediaAnalysisResult {
  type: 'image' | 'audio' | 'video' | 'multimodal';
  analysis?: string;
  transcription?: string;
  error?: boolean;
  simulated?: boolean;
  fileType?: string;
  questionText?: string;
  actionPlanSuggestion?: string;
  hasNonConformity?: boolean;
  imageAnalysis?: string;
  videoAnalysis?: string;
  audioTranscription?: string;
  contextAnalysis?: string;
}

export function useMediaAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MediaAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyzeMedia = async (
    mediaUrl: string, 
    mediaType: string, 
    questionText?: string,
    contextData?: any
  ): Promise<MediaAnalysisResult | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      
      console.log("🔍 useMediaAnalysis: Iniciando análise de mídia:", mediaUrl);
      console.log("useMediaAnalysis: Tipo de mídia:", mediaType);
      console.log("useMediaAnalysis: Pergunta:", questionText);
      
      if (!mediaUrl) {
        throw new Error("URL da mídia não fornecida");
      }

      if (!mediaType) {
        throw new Error("Tipo de mídia não fornecido");
      }
      
      // Special handling for multimodal analysis
      const isMultimodal = mediaType === "multimodal/context";
      
      if (!isMultimodal) {
        // Adjust media type for better compatibility
        // If it's a webm audio file, ensure it's treated as audio
        if (mediaUrl.includes('audio') && mediaUrl.endsWith('.webm')) {
          mediaType = 'audio/webm';
        }
        
        // Get specific file type based on extension
        const fileExtension = mediaUrl.split('.').pop()?.toLowerCase() || '';
        const specificFileType = determineSpecificFileType(fileExtension);
        
        console.log("useMediaAnalysis: Tipo de mídia detectado:", mediaType);
        console.log("useMediaAnalysis: Tipo específico:", specificFileType);
      } else {
        console.log("useMediaAnalysis: Realizando análise multimodal com contexto:", contextData);
      }
      
      // Simulate analysis for development (remove in production)
      // This is a temporary solution for testing during development
      const simulateAnalysis = true;
      
      if (simulateAnalysis) {
        console.log("useMediaAnalysis: Usando análise simulada para desenvolvimento");
        console.log("useMediaAnalysis: Contexto da pergunta:", questionText);
        
        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isMultimodal) {
          // Process multimodal analysis simulation
          return simulateMultimodalAnalysis(questionText, contextData);
        } else {
          // Create a simulated result based on media type and question context
          const simulatedResult: MediaAnalysisResult = {
            type: mediaType.includes('image') ? 'image' : 
                  mediaType.includes('audio') ? 'audio' : 'video',
            simulated: true,
            hasNonConformity: Math.random() > 0.5, // 50% chance of non-conformity
            fileType: mediaType,
            questionText: questionText
          };
          
          // Generate analysis based on question context if available
          const questionBasedAnalysis = generateContextBasedAnalysis(questionText, simulatedResult.type);
          
          // Add type-specific analysis
          if (simulatedResult.type === 'image') {
            simulatedResult.analysis = questionBasedAnalysis || `Na imagem analisada, observa-se ${Math.random() > 0.5 ? 
              'conformidade com os requisitos de segurança, com uso adequado de EPIs e procedimentos corretos' : 
              'possível não conformidade: falta de uso adequado de EPIs por parte de alguns funcionários'}`;
          } else if (simulatedResult.type === 'audio') {
            simulatedResult.transcription = questionBasedAnalysis || `Transcrição do áudio: "Este é um registro de ${Math.random() > 0.5 ? 
              'inspeção realizada conforme procedimentos padrão' : 
              'uma situação que pode indicar não conformidade com os procedimentos de segurança'}."`;
          } else {
            simulatedResult.analysis = questionBasedAnalysis || `Análise do vídeo: ${Math.random() > 0.5 ? 
              'O vídeo mostra procedimentos sendo executados corretamente, sem evidências de riscos à segurança' : 
              'O vídeo revela possíveis falhas nos procedimentos de segurança que precisam ser corrigidas'}`;
          }
          
          // Add action plan suggestion if there's non-conformity, based on question context
          if (simulatedResult.hasNonConformity) {
            simulatedResult.actionPlanSuggestion = generateContextBasedActionPlan(questionText) || 
              `Com base na análise, recomenda-se: 1) Realizar treinamento adicional sobre procedimentos de segurança; 2) Verificar disponibilidade e condições dos EPIs; 3) Programar nova inspeção em 15 dias para confirmar a correção das não conformidades.`;
          }
          
          console.log("useMediaAnalysis: Análise simulada concluída:", simulatedResult);
          setResult(simulatedResult);
          return simulatedResult;
        }
      }
      
      // Call edge function to analyze media
      const { data, error: functionError } = await supabase.functions.invoke('analyze-media', {
        body: { 
          mediaUrl, 
          mediaType, 
          questionText,
          contextData: isMultimodal ? contextData : undefined
        }
      });
      
      if (functionError) {
        console.error("useMediaAnalysis: Erro na função analyze-media:", functionError);
        throw new Error(`Erro na análise de mídia: ${functionError.message || "Erro desconhecido"}`);
      }
      
      if (!data) {
        throw new Error("Nenhum dado retornado da análise");
      }

      // Check if response indicates error in analysis
      if (data.error === true) {
        const errorMessage = data.message || data.analysis || data.transcription || "Erro na análise de mídia";
        console.error("useMediaAnalysis: Erro interno na análise:", errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log("✅ useMediaAnalysis: Análise de mídia concluída:", data);
      
      // Check if this is a simulation due to missing API key
      if (data.simulated) {
        toast.warning("Usando análise simulada. Configure a API do OpenAI para resultados reais.", {
          duration: 6000
        });
      }
      
      // Format result to avoid errors when saving to database
      const formattedResult: MediaAnalysisResult = {
        type: data.type || 'image',
        analysis: data.analysis || undefined,
        transcription: data.transcription || undefined,
        hasNonConformity: !!data.hasNonConformity,
        actionPlanSuggestion: data.actionPlanSuggestion || undefined,
        simulated: !!data.simulated,
        fileType: isMultimodal ? 'multimodal/context' : mediaType,
        questionText: questionText || undefined,
        imageAnalysis: data.imageAnalysis,
        videoAnalysis: data.videoAnalysis,
        audioTranscription: data.audioTranscription,
        contextAnalysis: data.contextAnalysis
      };
      
      setResult(formattedResult);
      
      return formattedResult;
    } catch (error: any) {
      console.error("useMediaAnalysis: Erro ao analisar mídia:", error);
      setError(error);
      
      // Show user-friendly error message
      const friendlyMessage = error.message?.includes("API do OpenAI") 
        ? "A análise falhou. Verifique se a chave da API OpenAI está configurada corretamente."
        : `Falha na análise: ${error.message || "Erro desconhecido"}`;
      
      toast.error(friendlyMessage);
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };
  
  const simulateMultimodalAnalysis = (questionText?: string, contextData?: any): MediaAnalysisResult => {
    console.log("useMediaAnalysis: Simulando análise multimodal");
    
    const responseValue = contextData?.responseValue;
    const mediaUrls = contextData?.mediaUrls || [];
    const hasMedia = mediaUrls.length > 0;
    const hasNegativeResponse = responseValue === false || responseValue === "não";
    
    // Determine simulated non-conformity based on response value and random factor
    const hasNonConformity = hasNegativeResponse || (Math.random() > 0.7); // Higher chance of non-conformity if negative response
    
    let analysisText = "";
    if (questionText) {
      if (hasNegativeResponse) {
        analysisText = `A análise da resposta negativa "${questionText}" indica uma não conformidade que requer atenção. `;
      } else {
        analysisText = `A pergunta "${questionText}" foi analisada no contexto da inspeção. `;
      }
      
      analysisText += hasNonConformity 
        ? "Foram identificados potenciais problemas que precisam ser corrigidos." 
        : "Não foram identificados problemas significativos.";
    }
    
    // Simulate image analysis if there are media URLs
    let imageAnalysis = "";
    let videoAnalysis = "";
    let audioTranscription = "";
    
    if (hasMedia) {
      const mediaTypes = mediaUrls.map((url: string) => {
        const fileType = url.split('.').pop()?.toLowerCase();
        if (fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg') return 'image';
        if (fileType === 'mp4' || fileType === 'webm' || fileType === 'mov') return 'video';
        if (fileType === 'mp3' || fileType === 'wav' || fileType === 'ogg') return 'audio';
        return 'unknown';
      });
      
      const hasImages = mediaTypes.includes('image');
      const hasVideos = mediaTypes.includes('video');
      const hasAudio = mediaTypes.includes('audio');
      
      if (hasImages) {
        imageAnalysis = hasNonConformity 
          ? "Nas imagens analisadas, foram detectadas possíveis não conformidades: equipamentos de proteção individual não sendo utilizados corretamente; áreas de risco sem a devantada sinalização; procedimentos de segurança não seguindo o protocolo estabelecido."
          : "As imagens foram analisadas e não apresentam evidências de não conformidades. Os equipamentos de proteção estão sendo utilizados conforme as normas e os procedimentos aparentam estar sendo seguidos corretamente.";
      }
      
      if (hasVideos) {
        videoAnalysis = hasNonConformity
          ? "A análise do conteúdo de vídeo revela momentos em que os protocolos de segurança não são seguidos adequadamente. É possível observar funcionários executando tarefas sem a devida proteção e em desacordo com as normas estabelecidas."
          : "Os vídeos analisados mostram procedimentos sendo executados de acordo com os protocolos estabelecidos. Não foram identificadas violações significativas de normas de segurança.";
      }
      
      if (hasAudio) {
        audioTranscription = hasNonConformity
          ? "Transcrição do áudio: '... estamos com problema no equipamento de proteção contra quedas. Alguns funcionários estão trabalhando sem o equipamento completo porque não temos peças de reposição suficientes...'"
          : "Transcrição do áudio: '... a inspeção hoje foi concluída com sucesso. Todos os itens foram verificados e estão em conformidade com as normas de segurança. A equipe está seguindo corretamente os procedimentos...'"
      }
    }
    
    // Generate action plan suggestion
    let actionPlanSuggestion = "";
    if (hasNonConformity) {
      actionPlanSuggestion = generateStructuredActionPlan(questionText, {
        hasImages: !!imageAnalysis,
        hasVideos: !!videoAnalysis,
        hasAudio: !!audioTranscription,
        hasNegativeResponse
      });
    }
    
    const result: MediaAnalysisResult = {
      type: 'multimodal',
      analysis: analysisText,
      simulated: true,
      hasNonConformity,
      fileType: 'multimodal/context',
      questionText,
      actionPlanSuggestion,
      imageAnalysis,
      videoAnalysis,
      audioTranscription
    };
    
    console.log("useMediaAnalysis: Resultado da análise multimodal simulada:", result);
    setResult(result);
    return result;
  };

  // Generate analysis based on question context
  const generateContextBasedAnalysis = (questionText?: string, mediaType?: string): string | null => {
    if (!questionText) return null;
    
    // Simple question context analysis for simulation
    const questionLower = questionText.toLowerCase();
    
    // Create context-based analysis
    if (questionLower.includes('epi') || questionLower.includes('equipamento') || questionLower.includes('proteção')) {
      return `Em relação à pergunta sobre EPIs: ${Math.random() > 0.5 ? 
        'A imagem mostra funcionários utilizando corretamente os equipamentos de proteção individual conforme exigido para a atividade' : 
        'Detectamos funcionários sem o uso adequado de EPIs obrigatórios para esta atividade, como capacete e luvas'}`;
    }
    
    if (questionLower.includes('limpeza') || questionLower.includes('organização')) {
      return `Referente à questão sobre limpeza e organização: ${Math.random() > 0.5 ? 
        'O ambiente apresenta-se limpo e organizado, seguindo os padrões de higiene adequados' : 
        'Foram identificados problemas de organização e limpeza no ambiente, com materiais fora do local apropriado e possíveis riscos de contaminação'}`;
    }
    
    if (questionLower.includes('sinalização') || questionLower.includes('placa')) {
      return `Sobre a sinalização mencionada na pergunta: ${Math.random() > 0.5 ? 
        'As placas de sinalização estão corretamente posicionadas e visíveis conforme as normas de segurança' : 
        'Nota-se ausência ou inadequação das placas de sinalização necessárias neste ambiente'}`;
    }
    
    if (questionLower.includes('procedimento') || questionLower.includes('norma')) {
      return `Em relação aos procedimentos mencionados: ${Math.random() > 0.5 ? 
        'Os procedimentos de trabalho visualizados estão em conformidade com as normas de segurança estabelecidas' : 
        'Identificamos desvios nos procedimentos de segurança exigidos para esta atividade'}`;
    }
    
    // Generic fallback that still references the question
    return `Em análise relacionada à pergunta "${questionText}": ${Math.random() > 0.5 ? 
      'Não foram identificadas não conformidades relevantes' : 
      'Foram detectados possíveis problemas que requerem atenção e correção'}`;
  };
  
  // Generate action plan based on question context
  const generateContextBasedActionPlan = (questionText?: string): string | null => {
    if (!questionText) return null;
    
    const questionLower = questionText.toLowerCase();
    
    if (questionLower.includes('epi') || questionLower.includes('equipamento') || questionLower.includes('proteção')) {
      return `Com base na análise relacionada aos EPIs, recomenda-se: 1) Realizar treinamento imediato sobre a importância e uso correto dos EPIs; 2) Verificar o estoque e condição dos equipamentos disponíveis; 3) Implementar checklist diário de verificação de uso de EPIs.`;
    }
    
    if (questionLower.includes('limpeza') || questionLower.includes('organização')) {
      return `Em relação aos problemas de organização e limpeza, sugere-se: 1) Implementar programa 5S na área; 2) Designar responsáveis por verificar a organização ao final de cada turno; 3) Instalar recipientes adequados para separação de resíduos.`;
    }
    
    if (questionLower.includes('sinalização') || questionLower.includes('placa')) {
      return `Para corrigir as questões de sinalização, recomenda-se: 1) Fazer levantamento completo das sinalizações necessárias conforme NR-26; 2) Substituir sinalizações danificadas; 3) Treinar a equipe sobre o significado e importância de cada sinalização.`;
    }
    
    if (questionLower.includes('procedimento') || questionLower.includes('norma')) {
      return `Para adequar os procedimentos de trabalho, sugere-se: 1) Revisar os procedimentos operacionais padrão; 2) Realizar reciclagem de treinamento para todos os colaboradores; 3) Implementar sistema de verificação periódica de conformidade.`;
    }
    
    // Generic fallback that still references the question
    return `Em relação à questão "${questionText}", recomenda-se: 1) Realizar análise detalhada das não conformidades identificadas; 2) Implementar medidas corretivas imediatas; 3) Programar nova inspeção em 15 dias para confirmar a eficácia das ações.`;
  };
  
  // Generate structured action plan based on context and available media
  const generateStructuredActionPlan = (questionText?: string, options?: any): string => {
    const { hasImages, hasVideos, hasAudio, hasNegativeResponse } = options || {};
    let actionPlan = "Plano de Ação Sugerido:\n\n";
    
    // Add 2-4 structured action items based on context
    if (questionText?.toLowerCase().includes('epi') || questionText?.toLowerCase().includes('proteção')) {
      actionPlan += "1. Realizar auditoria completa dos EPIs disponíveis e verificar conformidade com normas vigentes\n";
      actionPlan += "2. Implementar treinamento de reciclagem sobre uso correto de equipamentos de proteção\n";
      
      if (hasImages || hasNegativeResponse) {
        actionPlan += "3. Estabelecer sistema de verificação diária do uso adequado de EPIs pelos funcionários\n";
      }
      
      if (hasVideos || hasAudio) {
        actionPlan += "4. Documentar procedimentos corretos com material visual/audiovisual para treinamento\n";
      }
    } else if (questionText?.toLowerCase().includes('procedimento') || questionText?.toLowerCase().includes('norma')) {
      actionPlan += "1. Revisar procedimentos operacionais e atualizá-los conforme normas vigentes\n";
      actionPlan += "2. Realizar treinamento da equipe nos procedimentos corretos\n";
      
      if (hasNegativeResponse) {
        actionPlan += "3. Implementar sistema de supervisão para garantir cumprimento dos procedimentos\n";
      }
      
      if (hasImages || hasVideos) {
        actionPlan += "4. Criar material visual demonstrando procedimentos corretos e incorretos\n";
      }
    } else {
      // Generic action plan
      actionPlan += "1. Realizar análise detalhada das não conformidades identificadas\n";
      actionPlan += "2. Implementar medidas corretivas imediatas para os pontos críticos\n";
      
      if (hasImages || hasVideos || hasAudio) {
        actionPlan += "3. Documentar evidências após correção para comparação\n";
      }
      
      actionPlan += "4. Programar nova inspeção em 15 dias para verificar eficácia das ações implementadas\n";
    }
    
    return actionPlan;
  };

  return {
    analyzeMedia,
    resetAnalysis,
    isAnalyzing,
    result,
    error
  };
}
