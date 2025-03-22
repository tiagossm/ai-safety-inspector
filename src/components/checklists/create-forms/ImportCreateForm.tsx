
import React from "react";
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
import { CSVImportSection } from "./CSVImportSection";

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

export function ImportCreateForm(props: ImportCreateFormProps) {
  const { getTemplateFileUrl } = useChecklistImport();
  
  // Handler to clear file
  const clearFile = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    const event = {
      target: fileInput,
      currentTarget: fileInput,
      preventDefault: () => {}
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    props.onFileChange(event);
  };
  
  // Handler for text import
  const handleTextImport = (text: string) => {
    const blob = new Blob([text], { type: 'text/csv' });
    const file = new File([blob], 'imported-text.csv', { type: 'text/csv' });
    
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      
      const event = {
        target: fileInput,
        currentTarget: fileInput,
        preventDefault: () => {}
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      props.onFileChange(event);
    }
  };

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

      <CSVImportSection 
        file={props.file}
        onFileChange={props.onFileChange}
        onTextImport={handleTextImport}
        clearFile={clearFile}
        getTemplateFileUrl={getTemplateFileUrl}
      />
    </div>
  );
}
