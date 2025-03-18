
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

interface AICreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  onGenerateAI: () => void;
  aiLoading: boolean;
  companies: any[];
  loadingCompanies: boolean;
}

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
}: AICreateFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="space-y-2">
            <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
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

        <div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              name="due_date"
              value={form.due_date ? format(new Date(form.due_date), "yyyy-MM-dd") : ""}
              onChange={handleInputChange}
              min={format(new Date(), "yyyy-MM-dd")}
            />
            <p className="text-sm text-muted-foreground">
              Opcional. Se definida, indica quando esta lista deve ser concluída.
            </p>
          </div>
        </div>

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

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Bot className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Geração de Checklist com IA</h3>
                <p className="text-sm text-muted-foreground">
                  Digite uma descrição do checklist que você precisa e nossa IA irá gerá-lo para você.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">Prompt para IA <span className="text-red-500">*</span></Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Ex: Crie um checklist de inspeção de segurança para um canteiro de obras com foco em prevenção de acidentes."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground">
                  Seja específico sobre o tipo de checklist, área de aplicação e objetivo.
                </p>
              </div>

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
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Quantidade aproximada de perguntas a serem geradas.
                </p>
              </div>

              <Button
                type="button"
                onClick={onGenerateAI}
                disabled={!aiPrompt.trim() || aiLoading}
                className="w-full"
              >
                {aiLoading ? "Gerando..." : "Gerar Checklist com IA"}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>Dicas:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Especifique a área técnica (ex: segurança, manutenção, qualidade)</li>
                  <li>Mencione normas específicas se aplicável (ex: NR-10, ISO 9001)</li>
                  <li>Indique se é para um ambiente ou equipamento específico</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
