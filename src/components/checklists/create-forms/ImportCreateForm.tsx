
import React from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyListItem } from "@/types/CompanyListItem";
import { FormActions } from "./FormActions";
import { CSVImportSection } from "./CSVImportSection";
import { useCSVImport } from "@/hooks/checklist/form/useCSVImport";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showPreview, setShowPreview] = React.useState(false);
  
  const { 
    processedQuestions,
    isProcessing, 
    validationErrors,
    handleFileImport, 
    handleTextImport, 
    hasImportedQuestions,
    hasValidationErrors,
    getQuestionPreview,
    getValidationSummary,
    clearImportedData
  } = useCSVImport();

  const handleCSVDataParsed = (data: any[]) => {
    console.log("Dados CSV processados no formulário:", data);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasImportedQuestions) {
      return false;
    }
    
    return await onSubmit(e);
  };

  const validationSummary = getValidationSummary();
  const questionPreview = getQuestionPreview(3);

  // Integrar o file do prop com o hook CSV quando necessário
  React.useEffect(() => {
    if (file && !hasImportedQuestions) {
      handleFileImport(file);
    }
  }, [file, handleFileImport, hasImportedQuestions]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações básicas do checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Importação CSV */}
        <Card>
          <CardHeader>
            <CardTitle>Importar Perguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVImportSection
              onDataParsed={handleCSVDataParsed}
              file={file}
              onFileChange={onFileChange}
              onTextImport={handleTextImport}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status da importação */}
      {(hasImportedQuestions || hasValidationErrors || isProcessing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasValidationErrors ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Problemas Encontrados
                </>
              ) : hasImportedQuestions ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Perguntas Importadas
                </>
              ) : (
                "Processando..."
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processando dados CSV...</span>
              </div>
            )}

            {hasValidationErrors && (
              <div className="space-y-2">
                <div className="text-sm text-red-600 font-medium">
                  {validationErrors.length} erro(s) encontrado(s):
                </div>
                <ul className="text-sm text-red-600 space-y-1 pl-4">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="list-disc">{error}</li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImportedData}
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {hasImportedQuestions && !hasValidationErrors && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{validationSummary.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{validationSummary.requiredQuestions}</div>
                    <div className="text-sm text-gray-600">Obrigatórias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{validationSummary.optionalQuestions}</div>
                    <div className="text-sm text-gray-600">Opcionais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{validationSummary.multipleChoiceQuestions}</div>
                    <div className="text-sm text-gray-600">Múltipla Escolha</div>
                  </div>
                </div>

                <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {showPreview ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar Preview
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Preview das Perguntas
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-4">
                    {questionPreview.map((question, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{question.pergunta}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{question.tipo_resposta}</Badge>
                              {question.obrigatorio && (
                                <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                              )}
                              {question.opcoes && (
                                <Badge variant="outline" className="text-xs">
                                  {question.opcoes.length} opções
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {question.opcoes && (
                          <div className="mt-2 text-xs text-gray-600">
                            Opções: {question.opcoes.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                    {validationSummary.totalQuestions > 3 && (
                      <p className="text-sm text-gray-600 text-center italic">
                        ... e mais {validationSummary.totalQuestions - 3} perguntas
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/checklists")}
        canSubmit={!!form.title && hasImportedQuestions && !hasValidationErrors}
        submitText="Importar e Criar Checklist"
      />
    </form>
  );
}
