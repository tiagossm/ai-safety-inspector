
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  csvSuggestion?: string;
}

export function CSVChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente para criação de CSVs de checklist. Posso ajudar você a:\n\n• Criar perguntas específicas para sua área\n• Sugerir tipos de resposta adequados\n• Gerar exemplos de CSV\n• Validar seu formato\n\nComo posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const responseTypes = [
    { value: 'sim/não', description: 'Resposta binária (Sim/Não)' },
    { value: 'texto', description: 'Texto livre' },
    { value: 'seleção múltipla', description: 'Escolha única entre opções' },
    { value: 'numérico', description: 'Valores numéricos' },
    { value: 'foto', description: 'Captura de imagem' },
    { value: 'assinatura', description: 'Assinatura digital' },
    { value: 'time', description: 'Horário' },
    { value: 'date', description: 'Data' }
  ];

  const generateCSVSuggestion = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Exemplos específicos baseados no contexto
    if (input.includes('segurança') || input.includes('epi')) {
      return `pergunta,tipo_resposta,obrigatorio,opcoes
"Funcionário está usando EPI adequado?",sim/não,true,
"Qual o tipo de EPI utilizado?",seleção múltipla,true,"Capacete|Óculos|Luvas|Botinas|Outros"
"Condições do equipamento (1-10)",numérico,true,
"Observações sobre segurança",texto,false,
"Registro fotográfico do local",foto,false,
"Assinatura do responsável",assinatura,true,`;
    }
    
    if (input.includes('qualidade') || input.includes('produto')) {
      return `pergunta,tipo_resposta,obrigatorio,opcoes
"Produto está conforme especificação?",sim/não,true,
"Nível de qualidade",seleção múltipla,true,"Excelente|Bom|Regular|Ruim"
"Temperatura do produto",numérico,true,
"Descrição de não conformidades",texto,false,
"Foto do produto",foto,false,
"Horário da verificação",time,true,`;
    }
    
    if (input.includes('limpeza') || input.includes('higiene')) {
      return `pergunta,tipo_resposta,obrigatorio,opcoes
"Área está limpa e organizada?",sim/não,true,
"Nível de limpeza",seleção múltipla,true,"Excelente|Bom|Necessita melhoria|Inadequado"
"Produtos de limpeza utilizados",texto,false,
"Registro fotográfico",foto,false,
"Data da última limpeza",date,false,
"Assinatura do responsável",assinatura,true,`;
    }
    
    // Exemplo genérico
    return `pergunta,tipo_resposta,obrigatorio,opcoes
"Item está em conformidade?",sim/não,true,
"Nível de conformidade",seleção múltipla,true,"Alto|Médio|Baixo"
"Valor numérico",numérico,false,
"Observações gerais",texto,false,
"Registro fotográfico",foto,false,
"Horário da verificação",time,false,
"Data da verificação",date,false,
"Assinatura",assinatura,false,`;
  };

  const getAISuggestion = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('como') && input.includes('criar')) {
      return `Para criar um CSV de checklist, siga estes passos:

1. **Cabeçalhos obrigatórios**: pergunta, tipo_resposta, obrigatorio
2. **Cabeçalho opcional**: opcoes (para seleção múltipla)
3. **Tipos de resposta disponíveis**:
   ${responseTypes.map(type => `   • ${type.value}: ${type.description}`).join('\n')}

4. **Formato das opções**: Separe as opções com "|" (pipe)
5. **Obrigatório**: Use "true" ou "false"

Precisa de um exemplo específico para sua área?`;
    }
    
    if (input.includes('exemplo') || input.includes('modelo')) {
      return `Aqui está um exemplo completo com todos os tipos de resposta:

${generateCSVSuggestion(input)}

Este exemplo inclui diferentes tipos de perguntas que você pode adaptar para sua necessidade. Gostaria que eu customize para sua área específica?`;
    }
    
    if (input.includes('erro') || input.includes('problema')) {
      return `Problemas comuns e soluções:

🔍 **Erros frequentes**:
• Vírgulas dentro do texto (use aspas: "texto, com vírgula")
• Caracteres especiais não codificados
• Colunas faltando ou com nomes incorretos
• Opções sem separador "|"

✅ **Dicas para evitar erros**:
• Sempre use aspas para texto com vírgulas
• Mantenha os cabeçalhos exatos: pergunta, tipo_resposta, obrigatorio, opcoes
• Teste com poucas linhas primeiro
• Use UTF-8 para caracteres especiais`;
    }
    
    if (input.includes('obrigado') || input.includes('valeu')) {
      return `Fico feliz em ajudar! 😊 

Se precisar de mais assistência com seus CSVs de checklist, estarei aqui. Algumas sugestões:
• Teste seu CSV com dados pequenos primeiro
• Valide os tipos de resposta antes de importar
• Mantenha uma cópia de backup do seu CSV

Sucesso na criação dos seus checklists!`;
    }
    
    // Resposta padrão inteligente
    if (input.includes('segurança')) {
      return `Para checklists de segurança, recomendo focar em:

• **Perguntas sim/não** para conformidade básica
• **Seleção múltipla** para níveis de risco
• **Fotos** para registro de evidências
• **Assinaturas** para responsabilização
• **Campos numéricos** para medições

Gostaria que eu gere um exemplo específico de segurança do trabalho?`;
    }
    
    return `Entendi sua pergunta sobre "${userInput}". 

Posso ajudar você com:
• Criar exemplos de CSV específicos para sua área
• Explicar tipos de resposta disponíveis
• Resolver problemas de formatação
• Sugerir perguntas relevantes

Pode me dar mais detalhes sobre o tipo de checklist que você quer criar?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Simular processamento
    setTimeout(() => {
      const aiResponse = getAISuggestion(inputMessage);
      const csvSuggestion = inputMessage.toLowerCase().includes('exemplo') || 
                           inputMessage.toLowerCase().includes('modelo') ? 
                           generateCSVSuggestion(inputMessage) : undefined;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        csvSuggestion
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleCopyCSV = (csv: string) => {
    navigator.clipboard.writeText(csv);
    toast.success("CSV copiado para a área de transferência!");
  };

  const handleDownloadCSV = (csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'checklist-exemplo.csv';
    link.click();
    toast.success("Arquivo CSV baixado!");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Assistente CSV
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                    
                    {message.csvSuggestion && (
                      <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Exemplo CSV:</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCSV(message.csvSuggestion!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadCSV(message.csvSuggestion!)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {message.csvSuggestion}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta sobre CSV..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
