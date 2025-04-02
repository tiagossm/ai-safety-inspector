
import React from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyListItem } from "@/types/CompanyListItem";
import { FormActions } from "./FormActions";
import { useNavigate } from "react-router-dom";
import { X, Upload } from "lucide-react";

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  isSubmitting: boolean;
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
  onSubmit,
  isSubmitting
}: ImportCreateFormProps) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Checklist *</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do checklist"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Digite uma descrição para o checklist"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible_id">Responsável</Label>
                {loadingUsers ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select
                    value={form.responsible_id?.toString() || ""}
                    onValueChange={(value) => setForm({ ...form, responsible_id: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger id="responsible_id">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum responsável</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa</Label>
                {loadingCompanies ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select
                    value={form.company_id?.toString() || ""}
                    onValueChange={(value) => setForm({ ...form, company_id: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger id="company_id">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma empresa</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.fantasy_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo CSV *</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-center">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onFileChange({ target: { files: null } } as any)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Remover</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="mb-1 font-medium">Clique para selecionar ou arraste um arquivo</p>
                      <p className="text-sm text-muted-foreground mb-4">Formatos suportados: CSV</p>
                      <Input
                        id="file"
                        type="file"
                        accept=".csv"
                        onChange={onFileChange}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="file">Selecionar arquivo</label>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-md border mt-4">
                <h3 className="font-medium mb-2">Formato esperado do CSV</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  O arquivo CSV deve conter as seguintes colunas:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>pergunta (texto da pergunta)</li>
                  <li>tipo_resposta (sim/não, texto, múltipla escolha)</li>
                  <li>obrigatorio (sim/não)</li>
                  <li>opcoes (para perguntas de múltipla escolha, separadas por |)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/checklists")}
        canSubmit={true}
        submitText="Importar e Avançar"
      />
    </form>
  );
}
