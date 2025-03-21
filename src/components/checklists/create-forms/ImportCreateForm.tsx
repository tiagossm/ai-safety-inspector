import React, { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";
import { format } from "date-fns";
import { CompanyListItem } from "@/types/CompanyListItem";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

const FormFields = ({
  form, 
  setForm, 
  users, 
  loadingUsers, 
  companies, 
  loadingCompanies
}: Omit<ImportCreateFormProps, 'file' | 'onFileChange'>) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  return (
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
                    {company.fantasy_name || company.id}
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
  );
};

const FileUpload = ({ file, onFileChange }: Pick<ImportCreateFormProps, 'file' | 'onFileChange'>) => {
  const { getTemplateFileUrl } = useChecklistImport();
  const templateUrl = getTemplateFileUrl();
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInput = document.getElementById('file') as HTMLInputElement;
      fileInput.files = e.dataTransfer.files;
      
      // Create a synthetic event to pass to the original handler
      const event = {
        target: fileInput,
        currentTarget: fileInput,
        preventDefault: () => {}
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileChange(event);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file">
          Arquivo para Importar <span className="text-red-500">*</span>
        </Label>
        
        <div 
          className={`mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="w-full">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    const fileInput = document.getElementById('file') as HTMLInputElement;
                    fileInput.value = '';
                    const event = {
                      target: fileInput,
                      currentTarget: fileInput,
                      preventDefault: () => {}
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onFileChange(event);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-center font-medium mb-1">
                Arraste e solte seu arquivo aqui ou
              </p>
              <Input
                id="file"
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept=".csv,.xls,.xlsx"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file')?.click()}
                className="mt-2"
              >
                Selecionar arquivo
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Formatos suportados: CSV, XLS, XLSX.
              </p>
            </>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Não tem um modelo? 
            <a
              href={templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary ml-1 hover:underline"
            >
              Baixar modelo
            </a>
          </p>
          
          {file && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive/90"
              onClick={() => {
                const fileInput = document.getElementById('file') as HTMLInputElement;
                fileInput.value = '';
                const event = {
                  target: fileInput,
                  currentTarget: fileInput,
                  preventDefault: () => {}
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onFileChange(event);
              }}
            >
              Remover arquivo
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-medium text-blue-700 mb-1">Dicas para importação</h4>
        <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
          <li>Certifique-se de usar o formato correto (conforme o modelo)</li>
          <li>A primeira linha deve conter os cabeçalhos</li>
          <li>Campos obrigatórios: Pergunta e Tipo</li>
          <li>Para perguntas com múltipla escolha, separe as opções com vírgulas</li>
        </ul>
      </div>
    </div>
  );
};

export function ImportCreateForm(props: ImportCreateFormProps) {
  return (
    <div className="space-y-6">
      <FormFields 
        form={props.form}
        setForm={props.setForm}
        users={props.users}
        loadingUsers={props.loadingUsers}
        companies={props.companies}
        loadingCompanies={props.loadingCompanies}
      />

      <Card className="p-4">
        <FileUpload 
          file={props.file}
          onFileChange={props.onFileChange}
        />
      </Card>
    </div>
  );
}
