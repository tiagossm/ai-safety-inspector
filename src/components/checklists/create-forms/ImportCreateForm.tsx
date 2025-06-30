import React from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyListItem } from "@/types/CompanyListItem";
import { FormActions } from "./FormActions";
import { CSVImportSection } from "./CSVImportSection";
import { useCSVImport } from "@/hooks/checklist/form/useCSVImport";
import { useNavigate } from "react-router-dom";

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
  const { 
    parsedQuestions, 
    isProcessing, 
    handleFileImport, 
    handleTextImport, 
    hasImportedQuestions 
  } = useCSVImport();

  const handleCSVDataParsed = (data: any[]) => {
    console.log("Processando dados CSV:", data);
    // Os dados já foram processados pelo hook useCSVImport
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return await onSubmit(e);
  };

  // Integrar o file do prop com o hook CSV quando necessário
  React.useEffect(() => {
    if (file && !hasImportedQuestions) {
      handleFileImport(file);
    }
  }, [file, handleFileImport, hasImportedQuestions]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
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
                    value={form.responsible_id !== undefined ? String(form.responsible_id) : ""}
                    onValueChange={(value) => setForm({ 
                      ...form, 
                      responsible_id: value !== "" ? value : undefined 
                    })}
                  >
                    <SelectTrigger id="responsible_id">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum responsável</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
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
                    value={form.company_id !== undefined ? String(form.company_id) : ""}
                    onValueChange={(value) => setForm({ 
                      ...form, 
                      company_id: value !== "" ? value : undefined 
                    })}
                  >
                    <SelectTrigger id="company_id">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma empresa</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
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
                <Label>Importar Perguntas CSV</Label>
                <CSVImportSection
                  onDataParsed={handleCSVDataParsed}
                  file={file}
                  onFileChange={onFileChange}
                  onTextImport={handleTextImport}
                />
              </div>

              {hasImportedQuestions && (
                <div className="p-4 bg-green-50 rounded-md border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">
                    Perguntas Importadas ({parsedQuestions.length})
                  </h3>
                  <div className="max-h-32 overflow-y-auto">
                    {parsedQuestions.slice(0, 3).map((question, index) => (
                      <p key={index} className="text-sm text-green-700 mb-1">
                        {index + 1}. {question.pergunta || question.question || 'Pergunta sem título'}
                      </p>
                    ))}
                    {parsedQuestions.length > 3 && (
                      <p className="text-sm text-green-600 italic">
                        ... e mais {parsedQuestions.length - 3} perguntas
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">Processando dados CSV...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/checklists")}
        canSubmit={!!form.title}
        submitText="Importar e Avançar"
      />
    </form>
  );
}
