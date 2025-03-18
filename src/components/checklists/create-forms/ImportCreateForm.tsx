
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
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
import { FileUp, X } from "lucide-react";
import { NewChecklist } from "@/types/checklist";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileProcess?: (questions: any[]) => void;
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
  onFileProcess,
  companies,
  loadingCompanies,
}: ImportCreateFormProps) {
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleClearFile = () => {
    // Reset file input
    if (document.getElementById("file-upload") instanceof HTMLInputElement) {
      (document.getElementById("file-upload") as HTMLInputElement).value = "";
    }
    // Clear file state
    onFileChange({ target: { files: null } } as unknown as React.ChangeEvent<HTMLInputElement>);
    setParsedQuestions([]);
  };

  useEffect(() => {
    if (file) {
      parseFile(file);
    }
  }, [file]);

  const parseFile = async (file: File) => {
    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the Excel data to our question format
          const questions = jsonData.map((row: any, index) => {
            return {
              pergunta: row.Pergunta || row.pergunta || `Pergunta ${index + 1}`,
              tipo_resposta: mapQuestionType(row.Tipo || row.tipo || "sim/não"),
              obrigatorio: typeof row.Obrigatório === 'boolean' ? row.Obrigatório : 
                           typeof row.obrigatorio === 'boolean' ? row.obrigatorio : true,
              ordem: index,
              opcoes: row.Opcoes || row.opcoes || null,
            };
          });
          
          setParsedQuestions(questions);
          if (onFileProcess) {
            onFileProcess(questions);
          }
          
          // Try to extract checklist title from filename
          if (!form.title || form.title === "") {
            const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
            setForm({
              ...form,
              title: fileNameWithoutExt || "Checklist Importado"
            });
          }
          
          toast.success(`${questions.length} perguntas encontradas no arquivo`);
        } catch (error) {
          console.error("Error parsing Excel:", error);
          toast.error("Erro ao processar o arquivo. Verifique o formato.");
        } finally {
          setIsParsing(false);
        }
      };
      
      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo");
        setIsParsing(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Erro ao ler o arquivo");
      setIsParsing(false);
    }
  };

  const mapQuestionType = (type: string): string => {
    type = type.toLowerCase();
    
    if (type.includes("sim") || type.includes("não") || type.includes("nao")) {
      return "sim/não";
    } else if (type.includes("texto")) {
      return "texto";
    } else if (type.includes("numerico") || type.includes("numérico") || type.includes("numero") || type.includes("número")) {
      return "numérico";
    } else if (type.includes("seleção") || type.includes("selecao") || type.includes("multipla") || type.includes("múltipla")) {
      return "seleção múltipla";
    } else if (type.includes("foto") || type.includes("imagem")) {
      return "foto";
    } else if (type.includes("assinatura")) {
      return "assinatura";
    }
    
    return "sim/não"; // Default type
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <FormField
            name="title"
            render={() => (
              <FormItem>
                <FormLabel>Título <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Título da lista de verificação"
                    name="title"
                    value={form.title || ""}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            name="category"
            render={() => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Select
                    value={form.category || "general"}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            name="description"
            render={() => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o propósito desta lista de verificação"
                    name="description"
                    value={form.description || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            name="due_date"
            render={() => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    name="due_date"
                    value={form.due_date ? format(new Date(form.due_date), "yyyy-MM-dd") : ""}
                    onChange={handleInputChange}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </FormControl>
                <FormDescription>
                  Opcional. Se definida, indica quando esta lista deve ser concluída.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            name="company_id"
            render={() => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  {loadingCompanies ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={form.company_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("company_id", value)}
                    >
                      <SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            name="responsible_id"
            render={() => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <FormControl>
                  {loadingUsers ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={form.responsible_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("responsible_id", value)}
                    >
                      <SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={onFileChange}
                disabled={isParsing}
              />
              
              {!file ? (
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <span className="text-lg font-medium">Upload de Planilha</span>
                  <span className="text-sm text-muted-foreground mt-1 text-center">
                    Arraste e solte ou clique para escolher um arquivo Excel ou CSV
                  </span>
                  <span className="text-xs text-muted-foreground mt-4">
                    Formatos suportados: .xlsx, .xls, .csv
                  </span>
                </label>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <FileUp className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClearFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isParsing ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                    </div>
                  ) : parsedQuestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Perguntas encontradas: {parsedQuestions.length}</p>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                        {parsedQuestions.map((q, index) => (
                          <div key={index} className="p-2 border-b last:border-b-0">
                            <p className="font-medium">{index + 1}. {q.pergunta}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                              <span>Tipo: {q.tipo_resposta}</span>
                              <span>• Obrigatório: {q.obrigatorio ? "Sim" : "Não"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Nenhuma pergunta encontrada. Verifique se o formato do arquivo está correto.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Modelo de Planilha</p>
              <p>
                A planilha deve conter as colunas: Pergunta, Tipo, Obrigatório, Opcoes (para seleção múltipla).
              </p>
              <p className="mt-1">
                <a 
                  href="/templates/checklist_template.xlsx" 
                  download 
                  className="text-primary underline"
                >
                  Baixar modelo de planilha
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
