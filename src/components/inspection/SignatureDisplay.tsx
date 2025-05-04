
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SignatureDisplayProps {
  signature: {
    signature_data: string;
    signer_name?: string;
    signed_at?: string;
  };
}

export function SignatureDisplay({ signature }: SignatureDisplayProps) {
  // Ensure signature has all expected properties
  if (!signature || !signature.signature_data) {
    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Signed by: {signature.signer_name || "Unknown"}
        </CardTitle>
        {signature.signed_at && (
          <p className="text-xs text-muted-foreground">
            Date: {format(new Date(signature.signed_at), "PPP p")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-2 bg-white">
          <img
            src={signature.signature_data}
            alt="Signature"
            className="max-h-32 w-auto mx-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}
