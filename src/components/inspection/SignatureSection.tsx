
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionSignatures, Signature } from "@/hooks/inspection/useInspectionSignatures";
import { SignatureDialog } from "./SignatureDialog";
import { SignatureDisplay } from "./SignatureDisplay";
import { FileSignature, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface SignatureSectionProps {
  inspectionId: string;
  isCompleted?: boolean;
}

export function SignatureSection({ inspectionId, isCompleted = false }: SignatureSectionProps) {
  const { signatures, loading, error, refreshSignatures } = useInspectionSignatures({
    inspectionId,
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get user details from the users table
          const { data, error } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Erro ao buscar detalhes do usuário:", error);
          }
            
          setCurrentUser(data || { id: user.id });
        }
      } catch (err) {
        console.error("Erro ao buscar usuário atual:", err);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const userHasSigned = currentUser && signatures.some(sig => sig.signer_id === currentUser.id);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refreshSignatures();
      toast.success("Informações de assinaturas atualizadas");
    } catch (err) {
      console.error("Erro ao tentar novamente:", err);
      toast.error("Não foi possível carregar as assinaturas");
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSignature className="mr-2 h-5 w-5" /> 
            Assinaturas
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <FileSignature className="mr-2 h-5 w-5" /> 
          Assinaturas
        </CardTitle>
        {error && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRetry} 
            disabled={isRetrying}
          >
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Recarregar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Falha ao carregar assinaturas. {error.message}
            </AlertDescription>
          </Alert>
        )}

        {signatures.length > 0 ? (
          <div className="space-y-4">
            {signatures.map((sig: Signature, index: number) => (
              <SignatureDisplay key={`${sig.signer_id}-${index}`} signature={sig} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {!error && "Nenhuma assinatura foi adicionada a esta inspeção ainda."}
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
                  Assinar Documento
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
