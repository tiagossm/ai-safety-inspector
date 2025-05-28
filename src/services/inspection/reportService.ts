import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { ReportOptions } from "@/types/inspection";
import { handleReportGenerationError } from "@/utils/inspection/errorHandling";
import { validateReportOptions } from "@/validation/inspectionValidation";

/**
 * Classe base para geradores de relatório
 */
abstract class ReportGenerator {
  protected options: ReportOptions;
  
  constructor(options: ReportOptions) {
    this.options = options;
  }
  
  /**
   * Método para gerar o relatório
   */
  abstract generate(): Promise<string | null>;
  
  /**
   * Método para buscar dados da inspeção
   */
  protected async fetchInspectionData() {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          companies (*),
          users!inspections_responsible_id_fkey (*),
          checklists (*)
        `)
        .eq('id', this.options.inspectionId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleReportGenerationError(error, "fetchInspectionData");
    }
  }
  
  /**
   * Método para buscar respostas da inspeção
   */
  protected async fetchInspectionResponses() {
    try {
      const { data, error } = await supabase
        .from('inspection_responses')
        .select(`
          *,
          inspection_items (*)
        `)
        .eq('inspection_id', this.options.inspectionId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleReportGenerationError(error, "fetchInspectionResponses");
    }
  }
  
  /**
   * Método para buscar assinaturas da inspeção
   */
  protected async fetchInspectionSignatures() {
    try {
      if (!this.options.includeSignatures) return [];
      
      const { data, error } = await supabase
        .from('inspection_signatures')
        .select(`
          *,
          users!inspection_signatures_signer_id_fkey (*)
        `)
        .eq('inspection_id', this.options.inspectionId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleReportGenerationError(error, "fetchInspectionSignatures");
    }
  }
  
  /**
   * Método para buscar planos de ação da inspeção
   */
  protected async fetchActionPlans() {
    try {
      if (!this.options.includeActionPlans) return [];
      
      const { data, error } = await supabase
        .from('inspection_action_plans')
        .select(`
          *,
          users!inspection_action_plans_assigned_to_fkey (*)
        `)
        .eq('inspection_id', this.options.inspectionId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleReportGenerationError(error, "fetchActionPlans");
    }
  }
  
  /**
   * Método para extrair o nome do responsável
   */
  protected getResponsibleName(inspection: any): string {
    if (inspection &&
      'responsible' in inspection &&
      inspection.responsible !== null &&
      typeof inspection.responsible === 'object') {
      
      const responsibleObj = inspection.responsible as Record<string, any>;
      if ('name' in responsibleObj && responsibleObj.name) {
        return responsibleObj.name as string;
      }
    }
    
    if (inspection && inspection.users && inspection.users.name) {
      return inspection.users.name;
    }
    
    return "Não atribuído";
  }
}

/**
 * Gerador de relatório em PDF
 */
class PDFReportGenerator extends ReportGenerator {
  async generate(): Promise<string | null> {
    try {
      // Buscar dados
      const inspection = await this.fetchInspectionData();
      const responses = await this.fetchInspectionResponses();
      const signatures = await this.fetchInspectionSignatures();
      const actionPlans = await this.fetchActionPlans();
      
      // Criar documento PDF
      const doc = new jsPDF();
      
      // Título
      const title = this.options.customTitle || "Relatório de Inspeção";
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      // Linha divisória
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 25, 196, 25);
      
      // Informações da inspeção
      doc.setFontSize(12);
      doc.text(`ID da Inspeção: ${this.options.inspectionId.substring(0, 8)}`, 14, 35);
      
      if (inspection?.companies) {
        doc.text(`Empresa: ${inspection.companies.fantasy_name || "N/A"}`, 14, 42);
        if (inspection.companies.cnpj) {
          doc.text(`CNPJ: ${inspection.companies.cnpj}`, 14, 49);
        }
      }
      
      doc.text(`Responsável: ${this.getResponsibleName(inspection)}`, 14, 56);
      
      if (inspection?.checklists) {
        doc.text(`Checklist: ${inspection.checklists.title || "N/A"}`, 14, 63);
      }
      
      doc.text(`Status: ${inspection?.status || "N/A"}`, 14, 70);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 77);
      
      // Linha divisória
      doc.line(14, 80, 196, 80);
      
      // Título da seção de itens
      doc.setFontSize(14);
      doc.text("Itens da Inspeção", 14, 90);
      
      // Itens da inspeção
      doc.setFontSize(10);
      let y = 100;
      
      if (responses && responses.length > 0) {
        responses.forEach((response, index) => {
          // Verificar se precisa adicionar nova página
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          const questionText = response.inspection_items?.pergunta || `Pergunta ${index + 1}`;
          const responseValue = response.response !== null && response.response !== undefined
            ? String(response.response)
            : "Sem resposta";
          
          // Número e texto da pergunta
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${questionText}`, 14, y);
          y += 7;
          
          // Resposta
          doc.setFont("helvetica", "normal");
          doc.text(`Resposta: ${responseValue}`, 20, y);
          y += 7;
          
          // Mídia (se houver e se solicitado)
          if (this.options.includeMedia && response.media_urls && response.media_urls.length > 0) {
            doc.text(`Mídia: ${response.media_urls.length} arquivo(s) anexado(s)`, 20, y);
            y += 7;
          }
          
          // Espaço entre perguntas
          y += 5;
        });
      } else {
        doc.text("Nenhum item respondido", 14, y);
        y += 10;
      }
      
      // Planos de ação (se solicitado)
      if (this.options.includeActionPlans && actionPlans && actionPlans.length > 0) {
        // Verificar se precisa adicionar nova página
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        
        // Título da seção
        doc.setFontSize(14);
        doc.text("Planos de Ação", 14, y);
        y += 10;
        
        // Listar planos de ação
        doc.setFontSize(10);
        actionPlans.forEach((plan, index) => {
          // Verificar se precisa adicionar nova página
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${plan.title}`, 14, y);
          y += 7;
          
          doc.setFont("helvetica", "normal");
          doc.text(`Descrição: ${plan.description}`, 20, y);
          y += 7;
          
          doc.text(`Prioridade: ${plan.priority}`, 20, y);
          y += 7;
          
          doc.text(`Status: ${plan.status}`, 20, y);
          y += 7;
          
          if (plan.due_date) {
            doc.text(`Data limite: ${new Date(plan.due_date).toLocaleDateString()}`, 20, y);
            y += 7;
          }
          
          if (plan.users && plan.users.name) {
            doc.text(`Responsável: ${plan.users.name}`, 20, y);
            y += 7;
          }
          
          // Espaço entre planos
          y += 5;
        });
      }
      
      // Assinaturas (se solicitado)
      if (this.options.includeSignatures && signatures && signatures.length > 0) {
        // Verificar se precisa adicionar nova página
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        
        // Título da seção
        doc.setFontSize(14);
        doc.text("Assinaturas", 14, y);
        y += 10;
        
        // Listar assinaturas
        doc.setFontSize(10);
        signatures.forEach((signature, index) => {
          const signerName = signature.users?.name || signature.signer_name || `Assinante ${index + 1}`;
          
          doc.setFont("helvetica", "bold");
          doc.text(signerName, 14, y);
          y += 7;
          
          if (signature.signer_role) {
            doc.setFont("helvetica", "normal");
            doc.text(`Função: ${signature.signer_role}`, 20, y);
            y += 7;
          }
          
          doc.text(`Data: ${new Date(signature.created_at || Date.now()).toLocaleDateString()}`, 20, y);
          y += 10;
        });
      }
      
      // Rodapé personalizado (se fornecido)
      if (this.options.customFooter) {
        doc.setFontSize(8);
        doc.text(this.options.customFooter, 14, 285);
      }
      
      // Gerar nome do arquivo
      const filename = `inspection-${this.options.inspectionId.substring(0, 8)}.pdf`;
      
      // Salvar PDF
      const pdfOutput = doc.output('datauristring');
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = pdfOutput;
      link.download = filename;
      link.click();
      
      return pdfOutput;
    } catch (error) {
      throw handleReportGenerationError(error, "PDFReportGenerator.generate");
    }
  }
}

/**
 * Gerador de relatório em Excel
 */
class ExcelReportGenerator extends ReportGenerator {
  async generate(): Promise<string | null> {
    try {
      // Buscar dados
      const inspection = await this.fetchInspectionData();
      const responses = await this.fetchInspectionResponses();
      const signatures = await this.fetchInspectionSignatures();
      const actionPlans = await this.fetchActionPlans();
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Adicionar planilha de detalhes da inspeção
      const detailsData = [
        ["Relatório de Inspeção", ""],
        ["", ""],
        ["ID da Inspeção", this.options.inspectionId],
        ["Empresa", inspection?.companies?.fantasy_name || "N/A"],
        ["CNPJ", inspection?.companies?.cnpj || "N/A"],
        ["Responsável", this.getResponsibleName(inspection)],
        ["Checklist", inspection?.checklists?.title || "N/A"],
        ["Status", inspection?.status || "N/A"],
        ["Data", new Date().toLocaleDateString()]
      ];
      
      const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
      XLSX.utils.book_append_sheet(wb, detailsSheet, "Detalhes");
      
      // Adicionar planilha de respostas
      const responsesHeaders = ["Nº", "Pergunta", "Resposta", "Mídia"];
      const responsesData = [responsesHeaders];
      
      if (responses && responses.length > 0) {
        responses.forEach((response, index) => {
          const questionText = response.inspection_items?.pergunta || `Pergunta ${index + 1}`;
          const responseValue = response.response !== null && response.response !== undefined
            ? String(response.response)
            : "Sem resposta";
          const mediaInfo = response.media_urls && response.media_urls.length > 0
            ? `${response.media_urls.length} arquivo(s)`
            : "Nenhum";
            
          responsesData.push([
            index + 1,
            questionText,
            responseValue,
            mediaInfo
          ]);
        });
      } else {
        responsesData.push(["-", "Nenhum item respondido", "-", "-"]);
      }
      
      const responsesSheet = XLSX.utils.aoa_to_sheet(responsesData);
      XLSX.utils.book_append_sheet(wb, responsesSheet, "Respostas");
      
      // Adicionar planilha de planos de ação (se solicitado)
      if (this.options.includeActionPlans && actionPlans && actionPlans.length > 0) {
        const actionPlansHeaders = ["Nº", "Título", "Descrição", "Prioridade", "Status", "Data Limite", "Responsável"];
        const actionPlansData = [actionPlansHeaders];
        
        actionPlans.forEach((plan, index) => {
          actionPlansData.push([
            index + 1,
            plan.title,
            plan.description,
            plan.priority,
            plan.status,
            plan.due_date ? new Date(plan.due_date).toLocaleDateString() : "N/A",
            plan.users?.name || plan.assigned_to_name || "Não atribuído"
          ]);
        });
        
        const actionPlansSheet = XLSX.utils.aoa_to_sheet(actionPlansData);
        XLSX.utils.book_append_sheet(wb, actionPlansSheet, "Planos de Ação");
      }
      
      // Adicionar planilha de assinaturas (se solicitado)
      if (this.options.includeSignatures && signatures && signatures.length > 0) {
        const signaturesHeaders = ["Nº", "Nome", "Função", "Data"];
        const signaturesData = [signaturesHeaders];
        
        signatures.forEach((signature, index) => {
          signaturesData.push([
            index + 1,
            signature.users?.name || signature.signer_name || `Assinante ${index + 1}`,
            signature.signer_role || "N/A",
            new Date(signature.created_at || Date.now()).toLocaleDateString()
          ]);
        });
        
        const signaturesSheet = XLSX.utils.aoa_to_sheet(signaturesData);
        XLSX.utils.book_append_sheet(wb, signaturesSheet, "Assinaturas");
      }
      
      // Gerar nome do arquivo
      const filename = `inspection-${this.options.inspectionId.substring(0, 8)}.xlsx`;
      
      // Exportar para Excel
      XLSX.writeFile(wb, filename);
      
      return filename;
    } catch (error) {
      throw handleReportGenerationError(error, "ExcelReportGenerator.generate");
    }
  }
}

/**
 * Gerador de relatório em CSV
 */
class CSVReportGenerator extends ReportGenerator {
  async generate(): Promise<string | null> {
    try {
      // Buscar dados
      const inspection = await this.fetchInspectionData();
      const responses = await this.fetchInspectionResponses();
      const signatures = await this.fetchInspectionSignatures();
      const actionPlans = await this.fetchActionPlans();
      
      // Criar arrays para CSV
      const csvData: string[][] = [];
      
      // Adicionar informações da inspeção
      csvData.push(["Relatório de Inspeção"]);
      csvData.push([]);
      csvData.push(["ID da Inspeção", this.options.inspectionId]);
      csvData.push(["Empresa", inspection?.companies?.fantasy_name || "N/A"]);
      csvData.push(["CNPJ", inspection?.companies?.cnpj || "N/A"]);
      csvData.push(["Responsável", this.getResponsibleName(inspection)]);
      csvData.push(["Checklist", inspection?.checklists?.title || "N/A"]);
      csvData.push(["Status", inspection?.status || "N/A"]);
      csvData.push(["Data", new Date().toLocaleDateString()]);
      csvData.push([]);
      
      // Adicionar respostas
      csvData.push(["Respostas"]);
      csvData.push(["Nº", "Pergunta", "Resposta", "Mídia"]);
      
      if (responses && responses.length > 0) {
        responses.forEach((response, index) => {
          const questionText = response.inspection_items?.pergunta || `Pergunta ${index + 1}`;
          const responseValue = response.response !== null && response.response !== undefined
            ? String(response.response)
            : "Sem resposta";
          const mediaInfo = response.media_urls && response.media_urls.length > 0
            ? `${response.media_urls.length} arquivo(s)`
            : "Nenhum";
            
          csvData.push([
            (index + 1).toString(),
            questionText,
            responseValue,
            mediaInfo
          ]);
        });
      } else {
        csvData.push(["-", "Nenhum item respondido", "-", "-"]);
      }
      
      // Adicionar planos de ação (se solicitado)
      if (this.options.includeActionPlans && actionPlans && actionPlans.length > 0) {
        csvData.push([]);
        csvData.push(["Planos de Ação"]);
        csvData.push(["Nº", "Título", "Descrição", "Prioridade", "Status", "Data Limite", "Responsável"]);
        
        actionPlans.forEach((plan, index) => {
          csvData.push([
            (index + 1).toString(),
            plan.title,
            plan.description,
            plan.priority,
            plan.status,
            plan.due_date ? new Date(plan.due_date).toLocaleDateString() : "N/A",
            plan.users?.name || plan.assigned_to_name || "Não atribuído"
          ]);
        });
      }
      
      // Adicionar assinaturas (se solicitado)
      if (this.options.includeSignatures && signatures && signatures.length > 0) {
        csvData.push([]);
        csvData.push(["Assinaturas"]);
        csvData.push(["Nº", "Nome", "Função", "Data"]);
        
        signatures.forEach((signature, index) => {
          csvData.push([
            (index + 1).toString(),
            signature.users?.name || signature.signer_name || `Assinante ${index + 1}`,
            signature.signer_role || "N/A",
            new Date(signature.created_at || Date.now()).toLocaleDateString()
          ]);
        });
      }
      
      // Converter arrays para CSV
      const csvContent = csvData.map(row => row.map(cell => {
        // Escapar aspas e adicionar aspas se necessário
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')).join('\n');
      
      // Gerar nome do arquivo
      const filename = `inspection-${this.options.inspectionId.substring(0, 8)}.csv`;
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      return url;
    } catch (error) {
      throw handleReportGenerationError(error, "CSVReportGenerator.generate");
    }
  }
}

/**
 * Fábrica de geradores de relatório
 */
class ReportGeneratorFactory {
  static createGenerator(options: ReportOptions): ReportGenerator {
    switch (options.format) {
      case 'pdf':
        return new PDFReportGenerator(options);
      case 'excel':
        return new ExcelReportGenerator(options);
      case 'csv':
        return new CSVReportGenerator(options);
      default:
        throw new Error(`Formato de relatório não suportado: ${options.format}`);
    }
  }
}

/**
 * Função principal para gerar relatório de inspeção
 * @param options Opções de relatório
 * @returns URL do relatório gerado
 */
export async function generateInspectionReport(options: ReportOptions): Promise<string | null> {
  try {
    // Validar opções
    const validation = validateReportOptions(options);
    if (!validation.valid) {
      throw new Error("Opções de relatório inválidas");
    }
    
    // Criar gerador apropriado
    const generator = ReportGeneratorFactory.createGenerator(options);
    
    // Gerar relatório
    return await generator.generate();
  } catch (error) {
    throw handleReportGenerationError(error, "generateInspectionReport");
  }
}

/**
 * Função para gerar relatório PDF de inspeção
 * @param options Opções de relatório
 * @returns URL do relatório gerado
 */
export async function generateInspectionPDF(options: ReportOptions): Promise<string | null> {
  return generateInspectionReport({ ...options, format: 'pdf' });
}

/**
 * Função para gerar relatório Excel de inspeção
 * @param options Opções de relatório
 * @returns URL do relatório gerado
 */
export async function generateInspectionExcel(options: ReportOptions): Promise<string | null> {
  return generateInspectionReport({ ...options, format: 'excel' });
}

/**
 * Função para gerar relatório CSV de inspeção
 * @param options Opções de relatório
 * @returns URL do relatório gerado
 */
export async function generateInspectionCSV(options: ReportOptions): Promise<string | null> {
  return generateInspectionReport({ ...options, format: 'csv' });
}

/**
 * Função para gerar relatório PDF simulado (para testes)
 * @param inspectionId ID da inspeção
 * @param inspectionData Dados da inspeção
 */
export function generateMockPDF(inspectionId: string, inspectionData: any): void {
  try {
    console.log(`Gerando relatório PDF simulado para inspeção ${inspectionId}`);
    console.log("Dados da inspeção:", inspectionData);
    
    // Criar documento PDF
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Inspeção", 14, 22);
    
    // Informações da inspeção
    doc.setFontSize(12);
    doc.text(`ID da Inspeção: ${inspectionId.substring(0, 8)}`, 14, 42);
    
    if (inspectionData.company) {
      doc.text(`Empresa: ${inspectionData.company.name || "N/A"}`, 14, 49);
    }
    
    if (inspectionData.responsible) {
      doc.text(`Responsável: ${inspectionData.responsible.name || "N/A"}`, 14, 56);
    }
    
    if (inspectionData.checklist) {
      doc.text(`Checklist: ${inspectionData.checklist.title || "N/A"}`, 14, 63);
    }
    
    doc.text(`Status: ${inspectionData.status || "N/A"}`, 14, 70);
    
    // Gerar nome do arquivo
    const filename = `inspection-${inspectionId.substring(0, 8)}.pdf`;
    
    // Salvar PDF
    const pdfOutput = doc.output('datauristring');
    
    // Criar link para download
    const link = document.createElement('a');
    link.href = pdfOutput;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error("Erro ao gerar PDF simulado:", error);
    throw handleReportGenerationError(error, "generateMockPDF");
  }
}

