import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";

// ...outros imports (MediaDialog, etc.)

export function MediaUploadInput(props) {
  const [modalPlanoAcaoAberto, setModalPlanoAcaoAberto] = useState(false);
  const [planoAcaoSugestao, setPlanoAcaoSugestao] = useState("");
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);

  // Handler correto:
  function handleAddActionPlan(suggestion: string) {
    setPlanoAcaoSugestao(suggestion || "");
    setModalPlanoAcaoAberto(true);
    setAnalysisDialogOpen(false);
  }

  // Botão de teste — depois pode remover!
  // <Button onClick={() => handleAddActionPlan("Exemplo de sugestão")}>Testar Modal</Button>

  return (
    <div>
      {/* ...outros componentes, upload, análise etc... */}

      <MediaAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        // ...outras props
        onAddActionPlan={handleAddActionPlan}
      />

      {/* Modal 5W2H */}
      <Dialog open={modalPlanoAcaoAberto} onOpenChange={setModalPlanoAcaoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plano de Ação (5W2H)</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={6}
            value={planoAcaoSugestao}
            onChange={e => setPlanoAcaoSugestao(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={() => setModalPlanoAcaoAberto(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
