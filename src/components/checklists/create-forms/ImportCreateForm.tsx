
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewChecklist } from "@/types/checklist";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileType, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companies: any[];
  loadingCompanies: boolean;
}

export function ImportCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  file,
  onFileChange,
  companies,
  loadingCompanies,
}: ImportCreateFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const downloadTemplateFile = () => {
    // The template file URL can be generated from a hook, but for now we'll just use a static example
    const templateUrl = "https://example.com/template.xlsx";
    window.open(templateUrl, "_blank");
    toast.info("Download de template iniciado");
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
                value={form.company_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("company_id", value)}
              >
                <SelectTrigger id="company_id">
                  <SelectValue placeholder="Selecione uma empresa (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma empresa</SelectItem>
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
                value={form.responsible_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("responsible_id", value)}
              >
                <SelectTrigger id="responsible_id">
                  <SelectValue placeholder="Selecione um responsável (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum responsável</SelectItem>
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
              <Upload className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-medium">Importar Planilha</h3>
                <p className="text-sm text-muted-foreground">
                  Importe perguntas de uma planilha para criar rapidamente sua lista de verificação.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileType className="h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium">
                    {file ? file.name : "Arraste ou clique para selecionar um arquivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos suportados: CSV, XLS, XLSX
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <div className="flex gap-2 mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" type="button" size="sm">
                        Selecionar Arquivo
                      </Button>
                    </label>
                    <Button 
                      variant="outline" 
                      type="button" 
                      size="sm"
                      onClick={downloadTemplateFile}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Template
                    </Button>
                  </div>
                </div>
              </div>
              
              {file && (
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileType className="h-5 w-5" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('file-upload') as HTMLInputElement;
                      if (input) input.value = '';
                      onFileChange({ target: { files: null } } as any);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>Instruções:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Sua planilha deve ter uma coluna "pergunta" ou "question"</li>
                  <li>Opcionalmente, inclua colunas para "tipo_resposta" e "obrigatorio"</li>
                  <li>Para respostas de múltipla escolha, separe opções com vírgulas</li>
                  <li>Baixe o modelo para um exemplo da estrutura correta</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
