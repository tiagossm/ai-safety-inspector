
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubChecklistEditor } from "./SubChecklistEditor";
import { SubChecklistAIGenerator } from "./SubChecklistAIGenerator";
import { List, Sparkles } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";

interface SubChecklistButtonProps {
  parentQuestionId: string;
  hasSubChecklist: boolean;
  subChecklistId?: string | null;
  onSubChecklistCreated: (subChecklistId: string) => void;
}

export function SubChecklistButton({
  parentQuestionId,
  hasSubChecklist,
  subChecklistId,
  onSubChecklistCreated
}: SubChecklistButtonProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const descriptionId = "subchecklist-description";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-2 w-full flex items-center justify-center gap-2"
      >
        <List className="h-4 w-4" />
        {hasSubChecklist 
          ? "Editar Sub-checklist" 
          : "Adicionar Sub-checklist"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-3xl"
          aria-describedby={descriptionId}
        >
          <DialogHeader>
            <DialogTitle>
              {hasSubChecklist ? "Editar Sub-checklist" : "Criar Sub-checklist"}
            </DialogTitle>
            <DialogDescription id={descriptionId}>
              Crie uma lista de verificação aninhada que será preenchida durante a inspeção.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as "manual" | "ai")}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Criação Manual</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Gerar com IA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <SubChecklistEditor
                parentQuestionId={parentQuestionId}
                existingSubChecklistId={subChecklistId}
                onSubChecklistCreated={(id) => {
                  onSubChecklistCreated(id);
                  setOpen(false);
                }}
              />
            </TabsContent>

            <TabsContent value="ai">
              <SubChecklistAIGenerator
                parentQuestion={{
                  id: parentQuestionId,
                  text: "Pergunta principal",
                  responseType: "yes_no",
                  isRequired: true,
                  weight: 1,
                  order: 0,
                  allowsPhoto: false,
                  allowsVideo: false,
                  allowsAudio: false,
                  allowsFiles: false
                } as ChecklistQuestion}
                onSubChecklistCreated={(id) => {
                  onSubChecklistCreated(id);
                  setOpen(false);
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
