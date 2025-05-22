import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errors";

export interface Signature {
  inspection_id: string;
  signer_id: string;
  signature_data: string;
  signed_at: string;
  signer_name?: string; // Nome do assinante via relacionamento
}

interface UseInspectionSignaturesProps {
  inspectionId: string;
  refresh?: boolean;
}

export function useInspectionSignatures({ inspectionId, refresh = false }: UseInspectionSignaturesProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSignatures = useCallback(async () => {
    if (!inspectionId) {
      console.error("ID de inspeção não fornecido");
      setSignatures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Buscando assinaturas para inspeção:", inspectionId);

      const { data, error } = await supabase
        .from("inspection_signatures")
        .select(`
          inspection_id,
          signer_id,
          signature_data,
          signed_at,
          users (name)
        `)
        .eq("inspection_id", inspectionId);

      if (error) {
        console.error("Erro na consulta Supabase:", error);
        throw error;
      }

      console.log("Assinaturas recebidas:", data);

      const formattedSignatures = data.map((sig: any) => ({
        ...sig,
        signer_name: sig.users?.name || "Usuário Desconhecido"
      }));

      setSignatures(formattedSignatures);
    } catch (err) {
      console.error("Erro ao buscar assinaturas:", err);
      setError(err instanceof Error ? err : new Error("Falha ao carregar assinaturas"));
      toast.error("Falha ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const addSignature = useCallback(
    async (signatureData: string, signerId: string) => {
      if (!inspectionId) {
        console.error("ID de inspeção não fornecido");
        return { success: false, error: new Error("ID de inspeção não fornecido") };
      }
      
      try {
        const { error } = await supabase.from("inspection_signatures").insert({
          inspection_id: inspectionId,
          signer_id: signerId,
          signature_data: signatureData,
          signed_at: new Date().toISOString()
        });

        if (error) {
          console.error("Erro ao adicionar assinatura:", error);
          throw error;
        }

        await fetchSignatures();
        return { success: true };
      } catch (err) {
        console.error("Erro ao adicionar assinatura:", err);
        return { success: false, error: err };
      }
    },
    [inspectionId, fetchSignatures]
  );

  const removeSignature = useCallback(
    async (signerId: string) => {
      if (!inspectionId) {
        console.error("ID de inspeção não fornecido");
        return { success: false, error: new Error("ID de inspeção não fornecido") };
      }
      
      try {
        const { error } = await supabase
          .from("inspection_signatures")
          .delete()
          .eq("inspection_id", inspectionId)
          .eq("signer_id", signerId);

        if (error) {
          console.error("Erro ao remover assinatura:", error);
          throw error;
        }

        await fetchSignatures();
        return { success: true };
      } catch (err) {
        console.error("Erro ao remover assinatura:", err);
        return { success: false, error: err };
      }
    },
    [inspectionId, fetchSignatures]
  );

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures, refresh]);

  return {
    signatures,
    loading,
    error,
    addSignature,
    removeSignature,
    refreshSignatures: fetchSignatures,
  };
}
