
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, Upload, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewChecklist } from "@/types/checklist";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  file,
  onFileChange
}: ImportCreateFormProps) {
  const { getTemplateFileUrl } = useChecklistImport();
  
  return (
    <div className="space-y-6">
      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Informações para importação</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Para importar corretamente, o arquivo deve conter as seguintes colunas:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pergunta (obrigatória)</li>
            <li>Tipo de Resposta (sim/não, numérico, texto, foto, audio_recording, file_upload, assinatura, seleção múltipla)</li>
            <li>Obrigatório (sim/não)</li>
            <li>Opções (apenas para tipo "seleção múltipla", separadas por vírgula)</li>
          </ul>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center" 
              onClick={() => window.open(getTemplateFileUrl(), '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar modelo
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="import-file">Selecione um arquivo CSV ou Excel</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="import-file" 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={onFileChange}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              title="Baixar modelo" 
              onClick={() => window.open(getTemplateFileUrl(), '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center">
              <Upload className="h-3 w-3 mr-1" />
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title-import">Título *</Label>
            <Input
              id="title-import"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título da lista de verificação"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category-import">Categoria</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="responsible-import">Responsável</Label>
            <Select 
              value={form.responsible_id || ""} 
              onValueChange={(value) => setForm({ ...form, responsible_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due-date-import">Data de vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date-import"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.due_date ? (
                    format(new Date(form.due_date), "PPP", { locale: ptBR })
                  ) : (
                    "Escolha uma data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.due_date ? new Date(form.due_date) : undefined}
                  onSelect={(date) => 
                    setForm({ ...form, due_date: date ? date.toISOString() : null })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template-import"
            checked={form.is_template}
            onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
          />
          <Label htmlFor="template-import">
            Salvar como template
          </Label>
        </div>
      </div>
    </div>
  );
}
