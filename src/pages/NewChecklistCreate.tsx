
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChecklistQuestion } from "@/types/newChecklist";
import { createDefaultQuestion } from "@/utils/typeConsistency";

export default function NewChecklistCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([createDefaultQuestion()]);

  const addQuestion = () => {
    const newQuestion = createDefaultQuestion();
    newQuestion.id = `temp-${Date.now()}`;
    newQuestion.order = questions.length;
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<ChecklistQuestion>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    // Implementation would go here
    console.log("Submitting checklist:", { title, description, isTemplate, questions });
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do checklist"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste checklist"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-template"
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
              />
              <Label htmlFor="is-template">É um template?</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Perguntas</h3>
              <Button onClick={addQuestion}>Adicionar Pergunta</Button>
            </div>
            
            {questions.map((question, index) => (
              <Card key={question.id || index} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Pergunta {index + 1}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        disabled={questions.length <= 1}
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestion(index, { text: e.target.value })}
                      placeholder="Digite a pergunta..."
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Resposta</Label>
                        <select
                          value={question.responseType}
                          onChange={(e) => updateQuestion(index, { 
                            responseType: e.target.value as ChecklistQuestion["responseType"]
                          })}
                          className="w-full p-2 border rounded"
                        >
                          <option value="sim/não">Sim/Não</option>
                          <option value="texto">Texto</option>
                          <option value="numérico">Numérico</option>
                          <option value="seleção múltipla">Múltipla Escolha</option>
                          <option value="foto">Foto</option>
                          <option value="assinatura">Assinatura</option>
                          <option value="hora">Hora</option>
                          <option value="data">Data</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={question.isRequired}
                          onCheckedChange={(checked) => updateQuestion(index, { isRequired: checked })}
                        />
                        <Label>Obrigatório</Label>
                      </div>
                    </div>

                    {question.responseType === "seleção múltipla" && (
                      <div>
                        <Label>Opções (uma por linha)</Label>
                        <Textarea
                          value={question.options?.join('\n') || ''}
                          onChange={(e) => {
                            const options = e.target.value.split('\n').filter(opt => opt.trim());
                            updateQuestion(index, { options });
                          }}
                          placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar Checklist</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
