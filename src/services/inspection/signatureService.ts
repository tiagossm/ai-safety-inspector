
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
    const { data, error } = await supabase
      .from("inspection_signatures")
      .select(`
        *,
        users:signer_id (name, email)
      `)
      .eq("inspection_id", inspectionId);

    if (error) throw error;

    return data.map((sig: any) => ({
      ...sig,
      signer_name: sig.signer_name || sig.users?.name
    }));
  } catch (error) {
    console.error("Error getting signatures:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Add a signature to an inspection
 */
export async function addSignatureToInspection(signatureData: SignatureData): Promise<SignatureData> {
  try {
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding signature:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Check if a user has signed an inspection
 */
export async function hasUserSignedInspection(inspectionId: string, userId: string): Promise<boolean> {
  try {
    const { data, error, count } = await supabase
      .from("inspection_signatures")
      .select("*", { count: "exact" })
      .eq("inspection_id", inspectionId)
      .eq("signer_id", userId);

    if (error) throw error;
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking if user signed:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Remove a signature from an inspection
 */
export async function removeSignature(inspectionId: string, signerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("inspection_signatures")
      .delete()
      .eq("inspection_id", inspectionId)
      .eq("signer_id", signerId);

    if (error) throw error;
  } catch (error) {
    console.error("Error removing signature:", error);
    throw new Error(getErrorMessage(error));
  }
}
