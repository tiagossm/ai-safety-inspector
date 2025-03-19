import { useState, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bot } from "lucide-react";
import { NewChecklist } from "@/types/checklist";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Vamos imaginar que, após chamar a IA, você obtém um array de perguntas no formato abaixo:
interface AIQuestion {
  text: string;
  type: string;
  required: boolean;
}

interface AICreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;

  // Função que só faz a chamada para gerar perguntas via IA (mas não salva no BD).
  // Normalmente, você chamaria essa função e armazenaria o resultado em algum state (veja abaixo).
  onGenerateAI: () => void;

  aiLoading: boolean;
  companies: any[];
  loadingCompanies: boolean;

  // Opcional: se quiser já ter um callback para salvar definitivamente no BD depois da edição
  onSaveChecklist?: (questions: AIQuestion[]) => void;
}

/**
 * AICreateForm
 * - Permite definir título, categoria, descrição, etc.
 * - Gera perguntas via IA (mas sem salvar no BD imediatamente).
 * - Exibe/edita as perguntas geradas antes de criar o checklist no banco.
 */
export function AICreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  aiPrompt,
  setAiPrompt,
  numQuestions,
  setNumQuestions,
  onGenerateAI,
  aiLoading,
  companies,
  loadingCompanies,
  onSaveChecklist,
}: AICreateFormProps) {
  // Aqui armazenamos as perguntas geradas pela IA para revisão/edição
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);

  /**
   * Exemplo de função de "mock" que simula perguntas retornadas da IA.
   * Em um fluxo real, você chamaria `onGenerateAI()`, receberia as perguntas do back
   * e então atualizaria este state com setAiQuestions(perguntas).
   */
  const handleMockGenerate = () => {
    onGenerateAI(); // Chama a função pai, caso faça requisições
    // Exemplo: simular perguntas retornando da IA
    const generated = Array.from({ length: numQuestions }).map((_, idx) => ({
      text: `Pergunta gerada #${idx + 1} (${aiPrompt.slice(0, 15)}...)`,
      type: "sim/não",
      required: false,
    }));
    setAiQuestions(generated);
  };

  /**
   * Atualiza o formulário principal (título, descrição, etc.).
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /**
   * Atualiza selects (categoria, empresa, responsável).
   */
  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  /**
   * Atualiza localmente as perguntas da IA (edição).
   */
  const handleUpdateQuestion = (index: number, updated: Partial<AIQuestion>) => {
    setAiQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  /**
   * Remove uma pergunta se o usuário não quiser usá-la.
   */
  const handleRemoveQuestion = (index: number) => {
    setAiQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Quando o usuário confirmar o checklist,
   * chamamos a função "onSaveChecklist" (se existir) passando as perguntas editadas.
   */
  const handleSaveChecklist = () => {
    if (!onSaveChecklist) {
      console.warn("onSaveChecklist não foi fornecido. Implementar no pai!");
      return;
    }
    onSaveChecklist(aiQuestions);
  };

  return (
    <div className="space-y-6">
      {/* -- Dados do checklist (Título, Categoria, etc.) -- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Título */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Título da lista de verificação"
              name="title"
              value={form.title || ""}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={form.category || "general"}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito desta lista de verificação"
              name="description"
              value={form.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>

        {/* Data de Vencimento */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              name="due_date"
              value={
                form.due_date ? format(new Date(form.due_date), "yyyy-MM-dd") : ""
              }
              onChange={handleInputChange}
              min={format(new Date(), "yyyy-MM-dd")}
            />
            <p className="text-sm text-muted-foreground">
              Opcional. Se definida, indica quando esta lista deve ser concluída.
            </p>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="company_id">Empresa</Label>
            {loadingCompanies ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={form.company_id?.toString() || undefined}
                onValueChange={(value) => handleSelectChange("company_id", value)}
              >
                <SelectTrigger id="company_id">
                  <SelectValue placeholder="Selecione uma empresa (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma empresa</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name || company.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Responsável */}
        <div>
          <div className="space-y-2">
            <Label htmlFor="responsible_id">Responsável</Label>
            {loadingUsers ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={form.responsible_id?.toString() || undefined}
                onValueChange={(value) => handleSelectChange("responsible_id", value)}
              >
                <SelectTrigger id="responsible_id">
                  <SelectValue placeholder="Selecione um responsável (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum responsável</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* -- Seção de geração IA -- */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Bot className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Geração de Checklist com IA</h3>
                <p className="text-sm text-muted-foreground">
                  Digite uma descrição do checklist que você precisa e nossa IA irá
                  gerá-lo para você.
                </p>
              </div>
            </div>

            {/* Prompt para IA */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">
                  Prompt para IA <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Ex: Crie um checklist de inspeção de segurança para um canteiro de obras..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground">
                  Seja específico sobre o tipo de checklist, área de aplicação e
                  objetivo.
                </p>
              </div>

              {/* Slider de número de perguntas */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="num-questions">Número de Perguntas</Label>
                  <span className="text-sm font-medium">{numQuestions}</span>
                </div>
                <Slider
                  id="num-questions"
                  value={[numQuestions]}
                  onValueChange={(value) => setNumQuestions(value[0])}
                  min={5}
                  max={50}
                />
              </div>

              {/* Botão para gerar perguntas via IA */}
              <div className="flex justify-end">
                <Button variant="secondary" onClick={handleMockGenerate} disabled={aiLoading}>
                  {aiLoading ? "Gerando..." : "Gerar via IA"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -- Exibir e editar perguntas geradas (IA) -- */}
      {aiQuestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Perguntas Geradas pela IA</h4>

          {aiQuestions.map((q, index) => (
            <div
              key={index}
              className="border rounded p-3 flex flex-col gap-2 relative"
            >
              {/* Título da pergunta */}
              <div>
                <Label>Pergunta #{index + 1}</Label>
                <Input
                  value={q.text}
                  onChange={(e) =>
                    handleUpdateQuestion(index, { text: e.target.value })
                  }
                />
              </div>

              {/* Tipo de resposta */}
              <div>
                <Label>Tipo de Resposta</Label>
                <Select
                  value={q.type}
                  onValueChange={(value) => handleUpdateQuestion(index, { type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim/não">Sim/Não</SelectItem>
                    <SelectItem value="múltipla escolha">Múltipla Escolha</SelectItem>
                    <SelectItem value="texto">Texto Aberto</SelectItem>
                    <SelectItem value="audio">Áudio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pergunta obrigatória */}
              <div className="flex items-center gap-2">
                <Input
                  id={`required_${index}`}
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) =>
                    handleUpdateQuestion(index, { required: e.target.checked })
                  }
                />
                <Label htmlFor={`required_${index}`}>Obrigatória?</Label>
              </div>

              {/* Remover pergunta */}
              <div className="flex justify-end">
                <Button variant="destructive" onClick={() => handleRemoveQuestion(index)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          {/* Botão Final para SALVAR (se o parent passar a prop onSaveChecklist) */}
          {onSaveChecklist && (
            <Button variant="default" onClick={handleSaveChecklist}>
              Salvar Checklist
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
