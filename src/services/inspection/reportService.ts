import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Interface for report generation option
export interface ReportOptions {
  inspectionId: string;
  includeImages?: boolean;
  includeComments?: boolean;
  includeActionPlans?: boolean;
  format?: 'pdf' | 'excel' | 'csv';
  companyLogo?: string;
}

// Type for signature data with proper structure
interface SignatureType {
  signature_data?: string;
  signer_name?: string;
  signed_at?: string;
  users?: {
    name?: string;
  } | null;
}

/**
 * Generate and download an inspection report in specified format
 */
export async function generateInspectionReport(options: ReportOptions): Promise<string | null> {
  try {
    const { format = 'pdf' } = options;
    
    switch (format) {
      case 'pdf':
        return await generateInspectionPDF(options);
      case 'excel':
        return await generateInspectionExcel(options);
      case 'csv':
        return await generateInspectionCSV(options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Generate and download an inspection report PDF
 */
export async function generateInspectionPDF(options: ReportOptions): Promise<string | null> {
  try {
    const {
      inspectionId,
      includeImages = true,
      includeComments = true,
      includeActionPlans = true,
      companyLogo
    } = options;
    
    // Fetch the inspection data with all related information
    const { data: inspection, error: inspectionError } = await fetchInspectionData(inspectionId);
    
    if (inspectionError) {
      throw inspectionError;
    }
    
    // Fetch the inspection responses
    const { data: responses, error: responsesError } = await fetchInspectionResponses(inspectionId);
      
    if (responsesError) {
      throw responsesError;
    }
    
    // Fetch signatures if needed
    const { data: signatures, error: signaturesError } = await fetchInspectionSignatures(inspectionId);
      
    if (signaturesError) {
      throw signaturesError;
    }
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Inspection Report", 14, 22);
    
    // Add company logo if provided
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'PNG', 150, 10, 40, 20);
      } catch (logoError) {
        console.error("Error adding logo:", logoError);
      }
    }
    
    // Add inspection details
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Inspection ID: ${inspectionId.substring(0, 8)}`, 14, 42);
    
    if (inspection?.company) {
      doc.text(`Company: ${inspection.company.fantasy_name || "N/A"}`, 14, 49);
      if (inspection.company.cnpj) {
        doc.text(`CNPJ: ${inspection.company.cnpj}`, 14, 56);
      }
    }
    
    // Safely check for responsible data with comprehensive type narrowing
    if (inspection && 
        'responsible' in inspection && 
        inspection.responsible !== null && 
        typeof inspection.responsible === 'object') {
      // Use optional chaining and type guard to safely access the name property
      const responsibleObj = inspection.responsible;
      if (responsibleObj && 
          typeof responsibleObj === 'object' && 
          'name' in responsibleObj && 
          typeof responsibleObj.name === 'string') {
        doc.text(`Responsible: ${responsibleObj.name}`, 14, 63);
      } else {
        doc.text(`Responsible: N/A`, 14, 63);
      }
    } else {
      doc.text(`Responsible: N/A`, 14, 63);
    }
    
    if (inspection?.checklist) {
      doc.text(`Checklist: ${inspection.checklist.title || "N/A"}`, 14, 70);
    }
    
    doc.text(`Status: ${inspection?.status || "N/A"}`, 14, 77);
    
    // Add response table
    doc.setFontSize(14);
    doc.text("Inspection Items", 14, 90);
    
    // Create table data
    const tableData = (responses || []).map((response: any) => {
      let answer: string;
      
      switch (response.question?.tipo_resposta) {
        case "sim/não":
          answer = response.answer === "sim" ? "Yes" : "No";
          break;
        default:
          answer = response.answer || "No response";
      }
      
      const row = [
        response.question?.pergunta || "Unknown Question",
        answer
      ];
      
      if (includeComments && response.notes) {
        row.push(response.notes);
      } else {
        row.push("");
      }
      
      if (includeActionPlans && response.action_plan) {
        const actionPlan = typeof response.action_plan === "string" 
          ? response.action_plan 
          : JSON.stringify(response.action_plan);
        row.push(actionPlan);
      } else {
        row.push("");
      }
      
      return row;
    });
    
    // Create header for the table
    const tableHeaders = ["Question", "Response"];
    
    if (includeComments) {
      tableHeaders.push("Comments");
    }
    
    if (includeActionPlans) {
      tableHeaders.push("Action Plan");
    }
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 95,
      margin: { top: 85 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: function(data) {
        // Header
        doc.setFontSize(10);
        doc.text("Generated on " + new Date().toLocaleDateString(), 14, 10);
      }
    });
    
    // Add signatures if available
    if (signatures && signatures.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      
      doc.setFontSize(14);
      doc.text("Signatures", 14, finalY + 10);
      
      let yPos = finalY + 20;
      
      for (let i = 0; i < signatures.length; i++) {
        const signature = signatures[i] as SignatureType | null;
        
        if (!signature) continue; // Skip if signature is null or undefined
        
        // Check if we need to add a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        try {
          // Add signature image - only if signature_data is available
          if (signature && 'signature_data' in signature && signature.signature_data) {
            // Add signature image
            doc.addImage(signature.signature_data, 'PNG', 14, yPos, 70, 30);
            
            // Add signature details
            doc.setFontSize(10);
            
            // Get signer name with proper null checks
            let signerName = "Unknown";
            
            if (signature.signer_name) {
              signerName = signature.signer_name;
            } else if (
              signature.users && 
              typeof signature.users === 'object' &&
              signature.users !== null &&
              'name' in signature.users
            ) {
              signerName = signature.users.name || "Unknown";
            }
            
            doc.text(`Signed by: ${signerName}`, 14, yPos + 35);
            
            // Handle signed_at date with proper null check
            if (signature.signed_at) {
              const signedDate = new Date(signature.signed_at).toLocaleDateString();
              doc.text(`Date: ${signedDate}`, 14, yPos + 42);
            }
            
            yPos += 50;
          }
        } catch (signatureError) {
          console.error("Error adding signature:", signatureError);
        }
      }
    }
    
    // Save the PDF
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const filename = `inspection-${inspectionId.substring(0, 8)}.pdf`;
    
    // Trigger download
    downloadReport(url, filename);
    
    return url;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Generate and download an Excel report for an inspection
 */
export async function generateInspectionExcel(options: ReportOptions): Promise<string | null> {
  try {
    const {
      inspectionId,
      includeComments = true,
      includeActionPlans = true
    } = options;

    // Fetch the inspection data
    const { data: inspection, error: inspectionError } = await fetchInspectionData(inspectionId);
    
    if (inspectionError) {
      throw inspectionError;
    }
    
    // Fetch the inspection responses
    const { data: responses, error: responsesError } = await fetchInspectionResponses(inspectionId);
      
    if (responsesError) {
      throw responsesError;
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Add inspection details sheet
    const detailsData = [
      ["Inspection Report", ""],
      ["Date", new Date().toLocaleDateString()],
      ["Inspection ID", inspectionId],
      ["Company", inspection?.company?.fantasy_name || "N/A"],
      ["CNPJ", inspection?.company?.cnpj || "N/A"],
      ["Responsible", getResponsibleName(inspection)],
      ["Checklist", inspection?.checklist?.title || "N/A"],
      ["Status", inspection?.status || "N/A"],
    ];
    
    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(workbook, detailsSheet, "Overview");
    
    // Prepare responses data
    const responsesHeaders = ["Question", "Response"];
    if (includeComments) responsesHeaders.push("Comments");
    if (includeActionPlans) responsesHeaders.push("Action Plan");
    
    const responsesData = [responsesHeaders];
    
    (responses || []).forEach((response: any) => {
      let answer: string;
      
      switch (response.question?.tipo_resposta) {
        case "sim/não":
          answer = response.answer === "sim" ? "Yes" : "No";
          break;
        default:
          answer = response.answer || "No response";
      }
      
      const row = [
        response.question?.pergunta || "Unknown Question",
        answer
      ];
      
      if (includeComments) {
        row.push(response.notes || "");
      }
      
      if (includeActionPlans) {
        if (response.action_plan) {
          const actionPlan = typeof response.action_plan === "string" 
            ? response.action_plan 
            : JSON.stringify(response.action_plan);
          row.push(actionPlan);
        } else {
          row.push("");
        }
      }
      
      responsesData.push(row);
    });
    
    const responsesSheet = XLSX.utils.aoa_to_sheet(responsesData);
    XLSX.utils.book_append_sheet(workbook, responsesSheet, "Responses");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const filename = `inspection-${inspectionId.substring(0, 8)}.xlsx`;
    
    // Trigger download
    downloadReport(url, filename);
    
    return url;
  } catch (error) {
    console.error("Error generating Excel report:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Generate and download a CSV report for an inspection
 */
export async function generateInspectionCSV(options: ReportOptions): Promise<string | null> {
  try {
    const {
      inspectionId,
      includeComments = true,
      includeActionPlans = true
    } = options;

    // Fetch the inspection data
    const { data: inspection, error: inspectionError } = await fetchInspectionData(inspectionId);
    
    if (inspectionError) {
      throw inspectionError;
    }
    
    // Fetch the inspection responses
    const { data: responses, error: responsesError } = await fetchInspectionResponses(inspectionId);
      
    if (responsesError) {
      throw responsesError;
    }
    
    // Create CSV data array
    const csvData = [];
    
    // Add inspection details
    csvData.push(["Inspection Report"]);
    csvData.push(["Date", new Date().toLocaleDateString()]);
    csvData.push(["Inspection ID", inspectionId]);
    csvData.push(["Company", inspection?.company?.fantasy_name || "N/A"]);
    csvData.push(["CNPJ", inspection?.company?.cnpj || "N/A"]);
    csvData.push(["Responsible", getResponsibleName(inspection)]);
    csvData.push(["Checklist", inspection?.checklist?.title || "N/A"]);
    csvData.push(["Status", inspection?.status || "N/A"]);
    csvData.push([]);  // Empty row for separation
    
    // Add response headers
    const headers = ["Question", "Response"];
    if (includeComments) headers.push("Comments");
    if (includeActionPlans) headers.push("Action Plan");
    csvData.push(headers);
    
    // Add response data
    (responses || []).forEach((response: any) => {
      let answer: string;
      
      switch (response.question?.tipo_resposta) {
        case "sim/não":
          answer = response.answer === "sim" ? "Yes" : "No";
          break;
        default:
          answer = response.answer || "No response";
      }
      
      const row = [
        response.question?.pergunta || "Unknown Question",
        answer
      ];
      
      if (includeComments) {
        row.push(response.notes || "");
      }
      
      if (includeActionPlans) {
        if (response.action_plan) {
          const actionPlan = typeof response.action_plan === "string" 
            ? response.action_plan 
            : JSON.stringify(response.action_plan);
          row.push(actionPlan);
        } else {
          row.push("");
        }
      }
      
      csvData.push(row);
    });
    
    // Convert to CSV using PapaParse
    const csvContent = Papa.unparse(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const filename = `inspection-${inspectionId.substring(0, 8)}.csv`;
    
    // Trigger download
    downloadReport(url, filename);
    
    return url;
  } catch (error) {
    console.error("Error generating CSV report:", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Helper function to safely extract responsible name from inspection data
 */
function getResponsibleName(inspection: any): string {
  if (inspection && 
      'responsible' in inspection && 
      inspection.responsible !== null && 
      typeof inspection.responsible === 'object') {
    // Use optional chaining and type guards to safely access the name property
    const responsibleObj = inspection.responsible;
    if (responsibleObj && 
        typeof responsibleObj === 'object' && 
        'name' in responsibleObj && 
        typeof responsibleObj.name === 'string') {
      return responsibleObj.name;
    }
  }
  return "N/A";
}

/**
 * Fetch inspection data from the database
 */
async function fetchInspectionData(inspectionId: string) {
  return await supabase
    .from('inspections')
    .select(`
      *,
      company:company_id (fantasy_name, cnpj, cnae),
      responsible:responsible_id (name),
      checklist:checklist_id (title, description)
    `)
    .eq('id', inspectionId)
    .single();
}

/**
 * Fetch inspection responses from the database
 */
async function fetchInspectionResponses(inspectionId: string) {
  return await supabase
    .from('inspection_responses')
    .select(`
      *,
      question:question_id (pergunta, tipo_resposta)
    `)
    .eq('inspection_id', inspectionId);
}

/**
 * Fetch inspection signatures from the database
 */
async function fetchInspectionSignatures(inspectionId: string) {
  return await supabase
    .from('inspection_signatures')
    .select(`
      signature_data,
      signer_name,
      signed_at,
      users:signer_id (name)
    `)
    .eq('inspection_id', inspectionId);
}

/**
 * Download a generated report
 */
export function downloadReport(url: string, filename: string): void {
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a mock PDF report - fallback method
 */
export function generateMockPDF(inspectionId: string, inspectionData: any): void {
  // For now, we'll just print basic information to the console
  console.log(`Generating mock PDF report for inspection ${inspectionId}`);
  console.log("Inspection data:", inspectionData);
  
  try {
    // Create a simple PDF using jspdf
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Inspection Report", 14, 22);
    
    // Add inspection details
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Inspection ID: ${inspectionId.substring(0, 8)}`, 14, 42);
    
    if (inspectionData.company) {
      doc.text(`Company: ${inspectionData.company.name || "N/A"}`, 14, 49);
    }
    
    if (inspectionData.responsible) {
      doc.text(`Responsible: ${inspectionData.responsible.name || "N/A"}`, 14, 56);
    }
    
    if (inspectionData.checklist) {
      doc.text(`Checklist: ${inspectionData.checklist.title || "N/A"}`, 14, 63);
    }
    
    doc.text(`Status: ${inspectionData.status || "N/A"}`, 14, 70);
    
    // Add a simple table with sample data
    autoTable(doc, {
      head: [['Question', 'Response']],
      body: [
        ['Is equipment properly maintained?', 'Yes'],
        ['Are safety protocols being followed?', 'No'],
        ['Is the environment clean?', 'Yes'],
        ['Are there any visible hazards?', 'No'],
      ],
      startY: 80,
    });
    
    // Save the PDF
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const filename = `inspection-${inspectionId.substring(0, 8)}.pdf`;
    
    // Trigger download
    downloadReport(url, filename);
  } catch (error) {
    console.error("Error generating mock PDF:", error);
  }
}
