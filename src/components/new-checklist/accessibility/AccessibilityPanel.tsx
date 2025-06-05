
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Ear, 
  MousePointer, 
  Keyboard, 
  Palette, 
  Type,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";

interface AccessibilityPanelProps {
  onConfigChange: (config: AccessibilityConfig) => void;
}

interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
  fontSize: number;
  audioFeedback: boolean;
  tactileFeedback: boolean;
}

export function AccessibilityPanel({ onConfigChange }: AccessibilityPanelProps) {
  const [config, setConfig] = useState<AccessibilityConfig>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: true,
    keyboardNavigation: true,
    colorBlindSupport: false,
    fontSize: 16,
    audioFeedback: false,
    tactileFeedback: false
  });

  const [analysisResults, setAnalysisResults] = useState({
    score: 85,
    issues: [
      { type: 'warning', message: 'Algumas perguntas não têm texto alternativo para imagens' },
      { type: 'info', message: 'Considere adicionar mais opções de contraste' },
      { type: 'success', message: 'Navegação por teclado implementada' }
    ]
  });

  const updateConfig = (key: keyof AccessibilityConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const applyPreset = (preset: 'none' | 'basic' | 'full') => {
    let newConfig: AccessibilityConfig;
    
    switch (preset) {
      case 'none':
        newConfig = {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
          screenReader: false,
          keyboardNavigation: false,
          colorBlindSupport: false,
          fontSize: 16,
          audioFeedback: false,
          tactileFeedback: false
        };
        break;
      case 'basic':
        newConfig = {
          ...config,
          screenReader: true,
          keyboardNavigation: true,
          fontSize: 18
        };
        break;
      case 'full':
        newConfig = {
          highContrast: true,
          largeText: true,
          reduceMotion: true,
          screenReader: true,
          keyboardNavigation: true,
          colorBlindSupport: true,
          fontSize: 20,
          audioFeedback: true,
          tactileFeedback: true
        };
        break;
    }
    
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Acessibilidade
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Visual */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual
              </Label>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Alto contraste</Label>
                  <Switch
                    checked={config.highContrast}
                    onCheckedChange={(checked) => updateConfig('highContrast', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Texto grande</Label>
                  <Switch
                    checked={config.largeText}
                    onCheckedChange={(checked) => updateConfig('largeText', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Suporte a daltonismo</Label>
                  <Switch
                    checked={config.colorBlindSupport}
                    onCheckedChange={(checked) => updateConfig('colorBlindSupport', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Tamanho da fonte: {config.fontSize}px</Label>
                  <Slider
                    value={[config.fontSize]}
                    onValueChange={([value]) => updateConfig('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Motor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Motor
              </Label>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Navegação por teclado</Label>
                  <Switch
                    checked={config.keyboardNavigation}
                    onCheckedChange={(checked) => updateConfig('keyboardNavigation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Reduzir movimento</Label>
                  <Switch
                    checked={config.reduceMotion}
                    onCheckedChange={(checked) => updateConfig('reduceMotion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Feedback tátil</Label>
                  <Switch
                    checked={config.tactileFeedback}
                    onCheckedChange={(checked) => updateConfig('tactileFeedback', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Auditivo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Ear className="h-4 w-4" />
                Auditivo
              </Label>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Leitor de tela</Label>
                  <Switch
                    checked={config.screenReader}
                    onCheckedChange={(checked) => updateConfig('screenReader', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Feedback de áudio</Label>
                  <Switch
                    checked={config.audioFeedback}
                    onCheckedChange={(checked) => updateConfig('audioFeedback', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={() => applyPreset('none')}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Padrão</div>
                  <div className="text-sm text-gray-500">Configurações básicas</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => applyPreset('basic')}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Acessibilidade Básica</div>
                  <div className="text-sm text-gray-500">Leitor de tela + navegação</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => applyPreset('full')}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Acessibilidade Completa</div>
                  <div className="text-sm text-gray-500">Todas as opções ativadas</div>
                </div>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysisResults.score)}`}>
                {analysisResults.score}%
              </div>
              <div className="text-sm text-gray-600">Pontuação de Acessibilidade</div>
            </div>

            <div className="space-y-2">
              {analysisResults.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-white">
                  {issue.type === 'success' && <Check className="h-4 w-4 text-green-500 mt-0.5" />}
                  {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {issue.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                  <span className="text-sm">{issue.message}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" variant="outline">
              <Type className="h-4 w-4 mr-2" />
              Executar Análise Completa
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
