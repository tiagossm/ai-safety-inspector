

import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";

export interface SignatureData {
  id?: string;
  inspection_id: string;
  signer_id: string;
  signer_name?: string;
  signature_data: string;
  signed_at?: string;
}

/**
 * Get all signatures for an inspection
 */
export async function getInspectionSignatures(inspectionId: string): Promise<SignatureData[]> {
  try {
    if (!inspectionId) {
      throw new Error("ID de inspeção não fornecido");
    }
    
    console.log("Buscando assinaturas para inspeção:", inspectionId);
    
    const { data, error } = await supabase
      .from("inspection_signatures")
      .select(`
        *,
        users:signer_id (name, email)
      `)
      .eq("inspection_id", inspectionId);

    if (error) {
      console.error("Erro ao buscar assinaturas:", error);
      throw error;
    }

    console.log("Assinaturas encontradas:", data?.length || 0);
    
    return data.map((sig: any) => ({
      ...sig,
      signer_name: sig.signer_name || sig.users?.name
    }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Add a signature to an inspection
 */
export async function addSignatureToInspection(signatureData: SignatureData): Promise<SignatureData> {
  try {
    if (!signatureData.inspection_id) {
      throw new Error("ID de inspeção não fornecido");
    }
    
    if (!signatureData.signer_id) {
      throw new Error("ID do assinante não fornecido");
    }
    
    if (!signatureData.signature_data) {
      throw new Error("Dados da assinatura não fornecidos");
    }
    
    const { data, error } = await supabase
      .from("inspection_signatures")
      .insert({
        inspection_id: signatureData.inspection_id,
        signer_id: signatureData.signer_id,
        signer_name: signatureData.signer_name,
        signature_data: signatureData.signature_data
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar assinatura:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao adicionar assinatura:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Check if a user has signed an inspection
 */
export async function hasUserSignedInspection(inspectionId: string, userId: string): Promise<boolean> {
  try {
    if (!inspectionId || !userId) {
      throw new Error("ID de inspeção ou ID do usuário não fornecido");
    }
    
    const { data, error, count } = await supabase
      .from("inspection_signatures")
      .select("*", { count: "exact" })
      .eq("inspection_id", inspectionId)
      .eq("signer_id", userId);

    if (error) {
      console.error("Erro ao verificar se o usuário assinou:", error);
      throw error;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Erro ao verificar se usuário assinou:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Remove a signature from an inspection
 */
export async function removeSignature(inspectionId: string, signerId: string): Promise<void> {
  try {
    if (!inspectionId || !signerId) {
      throw new Error("ID de inspeção ou ID do assinante não fornecido");
    }
    
    const { error } = await supabase
      .from("inspection_signatures")
      .delete()
      .eq("inspection_id", inspectionId)
      .eq("signer_id", signerId);

    if (error) {
      console.error("Erro ao remover assinatura:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erro ao remover assinatura:", error);
    throw new Error(getErrorMessage(error));
  }
}
