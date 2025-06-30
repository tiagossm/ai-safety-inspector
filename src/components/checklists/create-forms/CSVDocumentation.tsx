
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function CSVDocumentation() {
  const [activeExample, setActiveExample] = useState<string>("basic");

  const responseTypes = [
    { 
      value: 'sim/não', 
      description: 'Resposta binária (Sim/Não)', 
      example: 'sim/não',
      color: 'bg-green-100 text-green-800'
    },
    { 
      value: 'texto', 
      description: 'Campo de texto livre', 
      example: 'texto',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      value: 'seleção múltipla', 
      description: 'Escolha única entre opções predefinidas', 
      example: 'seleção múltipla',
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      value: 'numérico', 
      description: 'Valores numéricos (inteiros ou decimais)', 
      example: 'numérico',
      color: 'bg-orange-100 text-orange-800'
    },
    { 
      value: 'foto', 
      description: 'Captura ou upload de imagem', 
      example: 'foto',
      color: 'bg-pink-100 text-pink-800'
    },
    { 
      value: 'assinatura', 
      description: 'Assinatura digital', 
      example: 'assinatura',
      color: 'bg-indigo-100 text-indigo-800'
    },
    { 
      value: 'time', 
      description: 'Horário (HH:MM)', 
      example: 'time',
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      value: 'date', 
      description: 'Data (DD/MM/AAAA)', 
      example: 'date',
      color: 'bg-teal-100 text-teal-800'
    }
  ];

  const examples = {
    basic: `pergunta,tipo_resposta,obrigatorio,opcoes
"Item está conforme?",sim/não,true,
"Observações",texto,false,
"Nível de qualidade",seleção múltipla,true,"Excelente|Bom|Regular|Ruim"`,

    complete: `pergunta,tipo_resposta,obrigatorio,opcoes
"Equipamento funcionando?",sim/não,true,
"Nível de qualidade",seleção múltipla,true,"Excelente|Bom|Regular|Ruim"
"Temperatura",numérico,true,
"Observações gerais",texto,false,
"Registro fotográfico",foto,false,
"Horário da verificação",time,false,
"Data da inspeção",date,false,
"Assinatura do responsável",assinatura,true,`,

    safety: `pergunta,tipo_resposta,obrigatorio,opcoes
"Funcionário usando EPI?",sim/não,true,
"Tipo de EPI",seleção múltipla,true,"Capacete|Óculos|Luvas|Botinas|Colete|Outros"
"Nível de risco (1-10)",numérico,true,
"Descrição do risco",texto,false,
"Foto da situação",foto,false,
"Horário da verificação",time,true,
"Assinatura do supervisor",assinatura,true,`,

    quality: `pergunta,tipo_resposta,obrigatorio,opcoes
"Produto conforme especificação?",sim/não,true,
"Classificação da qualidade",seleção múltipla,true,"A|B|C|Rejeitado"
"Medição dimensional",numérico,false,
"Defeitos identificados",texto,false,
"Registro fotográfico",foto,false,
"Data de produção",date,true,
"Assinatura do inspetor",assinatura,true,`
  };

  const commonErrors = [
    {
      error: "Vírgulas dentro do texto",
      solution: 'Use aspas: "Texto, com vírgula"',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />
    },
    {
      error: "Colunas com nomes incorretos",
      solution: "Use exatamente: pergunta, tipo_resposta, obrigatorio, opcoes",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />
    },
    {
      error: "Opções sem separador",
      solution: 'Separe com "|": "Opção1|Opção2|Opção3"',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />
    },
    {
      error: "Tipo de resposta inválido",
      solution: "Use apenas os tipos documentados",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />
    }
  ];

  const bestPractices = [
    "Sempre teste com poucas linhas primeiro",
    "Use UTF-8 para caracteres especiais",
    "Mantenha perguntas claras e objetivas",
    "Agrupe perguntas por contexto",
    "Use tipos de resposta apropriados",
    "Valide opções de seleção múltipla"
  ];

  const handleCopyExample = (example: string) => {
    navigator.clipboard.writeText(example);
    toast.success("Exemplo copiado para a área de transferência!");
  };

  const handleDownloadExample = (example: string, filename: string) => {
    const blob = new Blob([example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success("Arquivo baixado!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentação CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="structure">Estrutura</TabsTrigger>
              <TabsTrigger value="types">Tipos</TabsTrigger>
              <TabsTrigger value="examples">Exemplos</TabsTrigger>
              <TabsTrigger value="troubleshooting">Solução de Problemas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="structure" className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Estrutura Obrigatória</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Seu arquivo CSV deve conter estas colunas:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Obrigatório</Badge>
                      <code className="text-sm">pergunta</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Obrigatório</Badge>
                      <code className="text-sm">tipo_resposta</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Obrigatório</Badge>
                      <code className="text-sm">obrigatorio</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Opcional</Badge>
                      <code className="text-sm">opcoes</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Formato dos Dados</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>pergunta:</strong> Texto da pergunta (use aspas se contiver vírgulas)</p>
                  <p><strong>tipo_resposta:</strong> Um dos tipos válidos (veja aba "Tipos")</p>
                  <p><strong>obrigatorio:</strong> "true" ou "false"</p>
                  <p><strong>opcoes:</strong> Para seleção múltipla, separe com "|" (ex: "Opção1|Opção2")</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="types" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Tipos de Resposta Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {responseTypes.map((type) => (
                    <div key={type.value} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={type.color}>{type.value}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{type.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{type.example}</code>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="mt-4">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={activeExample === "basic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveExample("basic")}
                  >
                    Básico
                  </Button>
                  <Button
                    variant={activeExample === "complete" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveExample("complete")}
                  >
                    Completo
                  </Button>
                  <Button
                    variant={activeExample === "safety" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveExample("safety")}
                  >
                    Segurança
                  </Button>
                  <Button
                    variant={activeExample === "quality" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveExample("quality")}
                  >
                    Qualidade
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Exemplo: {activeExample}</h4>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyExample(examples[activeExample as keyof typeof examples])}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadExample(
                          examples[activeExample as keyof typeof examples],
                          `exemplo-${activeExample}.csv`
                        )}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {examples[activeExample as keyof typeof examples]}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="troubleshooting" className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Erros Comuns e Soluções</h3>
                <div className="space-y-3">
                  {commonErrors.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      {item.icon}
                      <div>
                        <p className="font-medium text-sm">{item.error}</p>
                        <p className="text-sm text-gray-600">{item.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Melhores Práticas</h3>
                <div className="space-y-2">
                  {bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
