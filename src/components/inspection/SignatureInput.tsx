
import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, RefreshCcw, Download } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SignatureInputProps {
  onSave: (signatureData: string, signerName: string) => void;
  title?: string;
  defaultName?: string;
}

export function SignatureInput({ onSave, title = "Signature", defaultName = "" }: SignatureInputProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [signerName, setSignerName] = useState(defaultName);
  const [isSigned, setIsSigned] = useState(false);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
    }
  };

  const handleSave = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        toast.error("Please provide a signature before saving");
        return;
      }

      if (!signerName.trim()) {
        toast.error("Please enter the name of the signer");
        return;
      }

      // Convert signature to data URL
      const signatureData = sigCanvas.current.toDataURL("image/png");
      
      // Call the onSave prop with the signature data and signer name
      onSave(signatureData, signerName);
      toast.success("Signature saved successfully");
    }
  };

  const handleDownload = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `signature-${signerName || "document"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("No signature to download");
    }
  };

  const handleBegin = () => {
    setIsSigned(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signer-name">Signer Name</Label>
          <Input
            id="signer-name"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Enter the name of the signer"
          />
        </div>

        <div className="border rounded-md p-1">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-40 border rounded bg-white",
            }}
            onBegin={handleBegin}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="mr-2"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!isSigned}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isSigned || !signerName.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Signature
        </Button>
      </CardFooter>
    </Card>
  );
}
