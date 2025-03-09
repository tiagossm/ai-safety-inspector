
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NewChecklist } from "@/types/checklist";
import { FormSection } from "./FormSection";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
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
      <p className="text-sm text-muted-foreground mb-6">
        Importe um arquivo CSV ou XLSX com a estrutura padrão para criar um checklist automaticamente.
      </p>
      
      <FormSection title="Informações Básicas">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Checklist</Label>
            <Input 
              id="title" 
              placeholder="Ex: Inspeção de Segurança Mensal" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input 
              id="category" 
              placeholder="Ex: Segurança, Manutenção" 
              value={form.category || ''} 
              onChange={(e) => setForm({...form, category: e.target.value})}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input 
            id="description" 
            placeholder="Descreva o objetivo deste checklist" 
            value={form.description || ''} 
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="responsible" 
            className="flex items-center gap-2"
          >
            Responsável
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">O responsável pela execução deste checklist</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          
          {loadingUsers ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <select 
              id="responsible"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.responsible_id || ''}
              onChange={(e) => setForm({...form, responsible_id: e.target.value})}
            >
              <option value="">Selecione um responsável</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          )}
        </div>
      </FormSection>
      
      <FormSection title="Arquivo para Importação">
        <div className="space-y-4">
          <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
            {file ? (
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remover arquivo
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">Arraste e solte ou clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mb-4">Suporta arquivos CSV, XLS e XLSX</p>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      onFileChange(files[0]);
                    }
                  }}
                />
                <label 
                  htmlFor="file-upload" 
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  Selecionar Arquivo
                </label>
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm space-y-1">
              <p className="font-medium">Estrutura do Arquivo:</p>
              <ul className="list-disc list-inside text-muted-foreground text-xs">
                <li>Pergunta</li>
                <li>Tipo de Resposta</li>
                <li>Obrigatório (Sim/Não)</li>
                <li>Ordem</li>
                <li>Opções (Para questões de múltipla escolha)</li>
                <li>Permite Áudio (Sim/Não)</li>
                <li>Permite Vídeo (Sim/Não)</li>
                <li>Permite Foto (Sim/Não)</li>
              </ul>
            </div>
            
            <a 
              href={getTemplateFileUrl()}
              download
              className="text-sm text-primary hover:underline"
            >
              Baixar Modelo
            </a>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
