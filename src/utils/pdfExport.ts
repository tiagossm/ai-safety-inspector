
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { ChecklistWithStats } from "@/types/newChecklist";
import { Checklist } from "@/types/checklist";
import { generateChecklistPDF } from "./pdfGenerator";

// Add type declaration for the autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Exports a checklist to PDF format
 * @param checklist The checklist to export
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export const exportChecklistToPDF = async (checklist: ChecklistWithStats): Promise<void> => {
  try {
    // Convert ChecklistWithStats to Checklist type for compatibility with generateChecklistPDF
    const compatibleChecklist: Checklist = {
      id: checklist.id,
      title: checklist.title,
      description: checklist.description || "",
      is_template: checklist.isTemplate,
      status_checklist: checklist.status === "active" ? "ativo" : "inativo",
      category: checklist.category || "general",
      responsible_id: checklist.responsibleId || null,
      company_id: checklist.companyId || null,
      user_id: checklist.userId || null,
      created_at: checklist.createdAt,
      updated_at: checklist.updatedAt,
      due_date: checklist.dueDate || null,
      items: checklist.totalQuestions,
      items_completed: checklist.completedQuestions
    };
    
    // Use the existing PDF generator that's already in the codebase
    await generateChecklistPDF(compatibleChecklist);
  } catch (error) {
    console.error("Error exporting checklist to PDF:", error);
    throw error;
  }
};

/**
 * Exports a list of checklists to PDF with table layout
 * @param checklists Array of checklists to export
 * @param title Title for the PDF document
 */
export const exportChecklistsTableToPDF = (checklists: ChecklistWithStats[], title = "Checklists"): void => {
  try {
    const doc = new jsPDF();
    
    // Set document title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Prepare data for the table
    const tableData = checklists.map(checklist => [
      checklist.title,
      checklist.category || "N/A",
      checklist.status === "active" ? "Ativo" : "Inativo",
      checklist.totalQuestions || 0,
      checklist.completedQuestions || 0,
      checklist.createdAt ? new Date(checklist.createdAt).toLocaleDateString() : "N/A"
    ]);
    
    // Generate the table
    doc.autoTable({
      head: [['Título', 'Categoria', 'Status', 'Perguntas', 'Concluídas', 'Data de Criação']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF file
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Error exporting checklists table to PDF:", error);
    throw error;
  }
};

/**
 * Exports a single checklist to CSV format
 * @param checklist The checklist to export
 */
export const exportChecklistToCSV = (checklist: ChecklistWithStats): void => {
  try {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    csvContent += "Título,Categoria,Status,Total de Perguntas,Concluídas,Data de Criação\n";
    
    // Add checklist data
    csvContent += `"${checklist.title}",`;
    csvContent += `"${checklist.category || ""}",`;
    csvContent += `"${checklist.status === "active" ? "Ativo" : "Inativo"}",`;
    csvContent += `${checklist.totalQuestions || 0},`;
    csvContent += `${checklist.completedQuestions || 0},`;
    csvContent += `"${checklist.createdAt ? new Date(checklist.createdAt).toLocaleDateString() : ""}"\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `checklist_${checklist.id}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting checklist to CSV:", error);
    throw error;
  }
};

/**
 * Share checklist via WhatsApp
 * @param checklist The checklist to share
 * @param baseUrl The base URL of the application
 */
export const shareChecklistViaWhatsApp = (checklist: ChecklistWithStats, baseUrl = window.location.origin): void => {
  const url = `${baseUrl}/checklists/${checklist.id}`;
  const text = `Confira este checklist: ${checklist.title}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Print checklist
 */
export const printChecklist = (): void => {
  window.print();
};
