
import { Checklist } from "@/types/checklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChecklistFormProps {
  checklist: Checklist;
  users: any[];
  setChecklist: React.Dispatch<React.SetStateAction<Checklist | null>>;
}

export default function ChecklistForm({ checklist, users, setChecklist }: ChecklistFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={checklist.title}
            onChange={(e) => setChecklist({...checklist, title: e.target.value})}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={checklist.category || "general"} 
              onValueChange={(value) => setChecklist({...checklist, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="environment">Meio Ambiente</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select 
              value={checklist.responsible_id || ""} 
              onValueChange={(value) => setChecklist({...checklist, responsible_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={checklist.description || ""}
            onChange={(e) => setChecklist({...checklist, description: e.target.value})}
            rows={3}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template"
            checked={checklist.is_template}
            onCheckedChange={(checked) => setChecklist({...checklist, is_template: checked})}
          />
          <Label htmlFor="template">Template</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={checklist.status_checklist === "ativo"}
            onCheckedChange={(checked) => 
              setChecklist({
                ...checklist, 
                status_checklist: checked ? "ativo" : "inativo"
              })
            }
          />
          <Label htmlFor="status">
            {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
