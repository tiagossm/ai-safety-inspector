
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionSignatures, Signature } from "@/hooks/inspection/useInspectionSignatures";
import { SignatureDialog } from "./SignatureDialog";
import { SignatureDisplay } from "./SignatureDisplay";
import { FileSignature, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignatureSectionProps {
  inspectionId: string;
  isCompleted?: boolean;
}

export function SignatureSection({ inspectionId, isCompleted = false }: SignatureSectionProps) {
  const { signatures, loading, error, refreshSignatures } = useInspectionSignatures({
    inspectionId,
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user details from the users table
        const { data } = await supabase
          .from('users')
          .select('id, name')
          .eq('id', user.id)
          .single();
          
        setCurrentUser(data || { id: user.id });
      }
    };
    
    fetchCurrentUser();
  }, []);

  const userHasSigned = currentUser && signatures.some(sig => sig.signer_id === currentUser.id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSignature className="mr-2 h-5 w-5" /> 
            Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSignature className="mr-2 h-5 w-5" /> 
          Signatures
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-destructive mb-4">
            Failed to load signatures: {error.message}
          </div>
        )}

        {signatures.length > 0 ? (
          <div className="space-y-4">
            {signatures.map((sig: Signature, index: number) => (
              <SignatureDisplay key={`${sig.signer_id}-${index}`} signature={sig} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No signatures have been added to this inspection yet.
          </div>
        )}

        {currentUser && !userHasSigned && !isCompleted && (
          <div className="mt-4 flex justify-center">
            <SignatureDialog
              inspectionId={inspectionId}
              userId={currentUser.id}
              userName={currentUser.name}
              onSignatureAdded={refreshSignatures}
              trigger={
                <Button>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Sign Document
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
