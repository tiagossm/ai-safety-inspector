
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Signature {
  inspection_id: string;
  signer_id: string;
  signer_name?: string;
  signature_data: string;
  signed_at: string;
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
      setSignatures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("inspection_signatures")
        .select(`
          inspection_id,
          signer_id,
          signer_name,
          signature_data,
          signed_at,
          users:signer_id (name)
        `)
        .eq("inspection_id", inspectionId);

      if (error) {
        throw error;
      }

      // Transform data to include user name if available
      const formattedSignatures = data.map((sig: any) => ({
        ...sig,
        signer_name: sig.signer_name || sig.users?.name || "Unknown User"
      }));

      setSignatures(formattedSignatures);
    } catch (err) {
      console.error("Error fetching signatures:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch signatures"));
      toast.error("Failed to load signatures");
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const addSignature = useCallback(
    async (signatureData: string, signerId: string, signerName?: string) => {
      try {
        const { error } = await supabase.from("inspection_signatures").insert({
          inspection_id: inspectionId,
          signer_id: signerId,
          signer_name: signerName,
          signature_data: signatureData,
        });

        if (error) {
          throw error;
        }

        await fetchSignatures();
        return { success: true };
      } catch (err) {
        console.error("Error adding signature:", err);
        return { success: false, error: err };
      }
    },
    [inspectionId, fetchSignatures]
  );

  const removeSignature = useCallback(
    async (signerId: string) => {
      try {
        const { error } = await supabase
          .from("inspection_signatures")
          .delete()
          .eq("inspection_id", inspectionId)
          .eq("signer_id", signerId);

        if (error) {
          throw error;
        }

        await fetchSignatures();
        return { success: true };
      } catch (err) {
        console.error("Error removing signature:", err);
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
