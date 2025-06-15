
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { supabase } from "@/integrations/supabase/client";
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

// Definir cores e estilos
const colors = {
  primary: '#00966E',
  secondary: '#FFBF00', 
  danger: '#D72638',
  text: '#333333',
  lightGray: '#F5F5F5',
  white: '#FFFFFF'
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
});

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
    
    // Criar o documento PDF diretamente
    const document = React.createElement(Document, {}, [
      // Capa
      React.createElement(Page, { key: 'cover', size: 'A4', style: styles.page }, [
        React.createElement(View, { key: 'header', style: styles.header }, [
          React.createElement(Text, { key: 'title', style: styles.title }, 'Relatório de Inspeção'),
          React.createElement(Image, { key: 'logo', style: styles.logo, src: '/lovable-uploads/LogoazulFT.png' })
        ]),
        React.createElement(View, { key: 'info', style: styles.section }, [
          React.createElement(View, { key: 'company', style: styles.infoRow }, [
            React.createElement(Text, { key: 'company-label', style: styles.label }, 'Empresa:'),
            React.createElement(Text, { key: 'company-value', style: styles.value }, reportData.inspection.companyName)
          ]),
          React.createElement(View, { key: 'checklist', style: styles.infoRow }, [
            React.createElement(Text, { key: 'checklist-label', style: styles.label }, 'Checklist:'),
            React.createElement(Text, { key: 'checklist-value', style: styles.value }, reportData.inspection.checklistTitle)
          ]),
          React.createElement(View, { key: 'inspector', style: styles.infoRow }, [
            React.createElement(Text, { key: 'inspector-label', style: styles.label }, 'Inspetor:'),
            React.createElement(Text, { key: 'inspector-value', style: styles.value }, reportData.inspector.name)
          ]),
          React.createElement(View, { key: 'date', style: styles.infoRow }, [
            React.createElement(Text, { key: 'date-label', style: styles.label }, 'Data:'),
            React.createElement(Text, { key: 'date-value', style: styles.value }, 
              new Date(reportData.inspection.createdAt).toLocaleDateString('pt-BR'))
          ])
        ])
      ]),
      
      // Resumo Executivo
      React.createElement(Page, { key: 'summary', size: 'A4', style: styles.page }, [
        React.createElement(Text, { key: 'summary-title', style: styles.title }, 'Resumo Executivo'),
        React.createElement(View, { key: 'summary-content', style: styles.section }, [
          React.createElement(Text, { key: 'summary-text' }, 
            `Conformidade: ${reportData.summary.conformityPercent}% | ` +
            `Não Conformidades: ${reportData.summary.totalNc} | ` +
            `Total de Mídias: ${reportData.summary.totalMedia} | ` +
            `Questões: ${reportData.summary.completedQuestions}/${reportData.summary.totalQuestions}`
          )
        ])
      ])
    ]);
    
    // Gerar o PDF usando react-pdf
    const pdfBlob = await pdf(document).toBlob();
    
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
