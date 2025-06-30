
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
import { AlertCircle, CheckCircle, Eye, EyeOff, FileSpreadsheet } from "lucide-react";
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
    clearImportedData,
    transformQuestionsForSubmit
  } = useCSVImport();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasImportedQuestions) {
      return false;
    }
    
    // Adicionar as perguntas transformadas ao formulário antes do submit
    const questionsToSubmit = transformQuestionsForSubmit();
    const formWithQuestions = {
      ...form,
      questions: questionsToSubmit
    };
    
    return await onSubmit(e);
  };

  const validationSummary = getValidationSummary();
  const questionPreview = getQuestionPreview(5);

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Seção de Importação CSV - Agora é o foco principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Importar Perguntas do Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CSVImportSection
              onDataParsed={() => {}} // Não precisamos mais desta callback
              onTextImport={handleTextImport}
              onFileChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileImport(e.target.files[0]);
                }
              }}
            />
          </CardContent>
        </Card>

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
                    Perguntas Importadas com Sucesso
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    Processando Dados CSV...
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Processando e validando dados CSV...</span>
                </div>
              )}

              {hasValidationErrors && (
                <div className="space-y-3">
                  <div className="text-sm text-red-600 font-medium">
                    {validationErrors.length} erro(s) encontrado(s):
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{validationSummary.totalQuestions}</div>
                      <div className="text-sm text-green-700 font-medium">Total de Perguntas</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{validationSummary.requiredQuestions}</div>
                      <div className="text-sm text-red-700 font-medium">Obrigatórias</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{validationSummary.optionalQuestions}</div>
                      <div className="text-sm text-blue-700 font-medium">Opcionais</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{validationSummary.multipleChoiceQuestions}</div>
                      <div className="text-sm text-purple-700 font-medium">Múltipla Escolha</div>
                    </div>
                  </div>

                  <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        {showPreview ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ocultar Preview das Perguntas
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Preview das Perguntas ({validationSummary.totalQuestions})
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-4">
                      {questionPreview.map((question, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                                  #{question.ordem}
                                </span>
                                {question.obrigatorio && (
                                  <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm mb-1">{question.pergunta}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{question.tipo_resposta}</Badge>
                                {question.opcoes && (
                                  <Badge variant="outline" className="text-xs">
                                    {question.opcoes.length} opções
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {question.opcoes && (
                            <div className="mt-2 p-2 bg-white rounded border text-xs">
                              <span className="text-gray-600 font-medium">Opções: </span>
                              <span className="text-gray-700">{question.opcoes.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {validationSummary.totalQuestions > 5 && (
                        <p className="text-sm text-gray-600 text-center italic py-2 border-t">
                          ... e mais {validationSummary.totalQuestions - 5} perguntas
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informações básicas do checklist - Simplificadas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <SelectValue placeholder="Selecione uma empresa (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma empresa</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Digite uma descrição para o checklist (opcional)"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <FormActions
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/new-checklists")}
          canSubmit={!!form.title && hasImportedQuestions && !hasValidationErrors}
          submitText={hasImportedQuestions ? `Criar Checklist com ${validationSummary.totalQuestions} Perguntas` : "Importar e Criar Checklist"}
        />
      </form>
    </div>
  );
}
