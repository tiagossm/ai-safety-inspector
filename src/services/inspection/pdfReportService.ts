import { pdf } from '@react-pdf/renderer';
import { supabase } from "@/integrations/supabase/client";
import { InspectionPDFDocument } from "@/components/reports/InspectionPDFDocument";
import { generateReportDTO } from "../reportDtoService";
import { toast } from "sonner";
import React from 'react';

export interface PDFGenerationOptions {
  includeHighResImages?: boolean;
  compressionLevel?: 'low' | 'medium' | 'high';
}

export interface PDFGenerationResult {
  url: string;
  sha256: string;
  size: number;
  fileName: string;
}

/**
 * Gera o PDF da inspeção e armazena no Supabase Storage
 */
export async function generateInspectionPDF(
  inspectionId: string, 
  options: PDFGenerationOptions = {}
): Promise<PDFGenerationResult> {
  try {
    console.log(`[PDF Report] Iniciando geração do PDF para inspeção: ${inspectionId}`);
    
    // Gerar DTO com todos os dados necessários
    const reportData = await generateReportDTO(inspectionId);
    
    // Gerar o PDF usando react-pdf - criar o elemento Document correto
    const pdfBlob = await pdf(<InspectionPDFDocument reportData={reportData} />).toBlob();
    
    // Verificar tamanho do PDF (máximo 8MB)
    const maxSizeBytes = 8 * 1024 * 1024; // 8MB
    if (pdfBlob.size > maxSizeBytes) {
      console.warn(`[PDF Report] PDF muito grande: ${(pdfBlob.size / 1024 / 1024).toFixed(2)}MB`);
      toast.warning(`PDF gerado com ${(pdfBlob.size / 1024 / 1024).toFixed(2)}MB. Considere reduzir a qualidade das imagens.`);
    }
    
    // Gerar nome do arquivo
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `${inspectionId}.pdf`;
    const filePath = `reports/${year}/${month}/${fileName}`;
    
    // Fazer upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      });
    
    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }
    
    // Obter URL assinada (24 horas)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('reports')
      .createSignedUrl(filePath, 24 * 60 * 60); // 24 horas
    
    if (urlError) {
      throw new Error(`Erro ao gerar URL: ${urlError.message}`);
    }
    
    // Calcular SHA-256 do arquivo
    const sha256 = await calculateSHA256(pdfBlob);
    
    console.log(`[PDF Report] PDF gerado com sucesso: ${filePath}`);
    
    return {
      url: urlData.signedUrl,
      sha256,
      size: pdfBlob.size,
      fileName
    };
    
  } catch (error) {
    console.error('[PDF Report] Erro na geração do PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Calcula o hash SHA-256 de um blob
 */
async function calculateSHA256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se o bucket reports existe e cria se necessário
 */
async function ensureReportsBucket(): Promise<boolean> {
  try {
    // Tentar listar buckets para verificar se 'reports' existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('[PDF Report] Erro ao listar buckets:', error);
      return false;
    }
    
    const reportsBucket = buckets?.find(b => b.name === 'reports');
    
    if (!reportsBucket) {
      console.log('[PDF Report] Bucket reports não encontrado, será necessário criar manualmente');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[PDF Report] Erro ao verificar bucket:', error);
    return false;
  }
}

/**
 * Comprime imagens se necessário
 */
async function compressImageIfNeeded(url: string, maxWidth: number = 1080): Promise<string> {
  try {
    // Para URLs externas, retornar como está
    if (url.startsWith('http') && !url.includes('supabase')) {
      return url;
    }
    
    // Para URLs do Supabase, verificar se precisa de compressão
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Se a imagem é pequena, retornar como está
    if (blob.size < 500 * 1024) { // 500KB
      return url;
    }
    
    // Implementar compressão básica usando Canvas (se necessário)
    return url; // Por enquanto, retornar original
    
  } catch (error) {
    console.warn('[PDF Report] Erro ao comprimir imagem:', error);
    return url; // Retornar original em caso de erro
  }
}
