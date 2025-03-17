
import { Company } from "@/types/company";
import { jsPDF } from "jspdf";
import { formatCNPJ } from "./formatters";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistItem } from "@/types/checklist";

export const generateCompanyPDF = (company: Company) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text("Relatório da Empresa", 20, 20);
  
  // Company Information
  doc.setFontSize(12);
  doc.text(`Nome Fantasia: ${company.fantasy_name || "Não informado"}`, 20, 40);
  doc.text(`CNPJ: ${formatCNPJ(company.cnpj)}`, 20, 50);
  doc.text(`CNAE: ${company.cnae || "Não informado"}`, 20, 60);
  doc.text(`Status: ${company.status === 'active' ? 'Ativo' : 'Inativo'}`, 20, 70);
  
  // Contact Information
  doc.text("Informações de Contato", 20, 90);
  doc.text(`Nome: ${company.contact_name || "Não informado"}`, 30, 100);
  doc.text(`Email: ${company.contact_email || "Não informado"}`, 30, 110);
  doc.text(`Telefone: ${company.contact_phone || "Não informado"}`, 30, 120);
  
  // Additional Information
  doc.text(`Funcionários: ${company.employee_count || "Não informado"}`, 20, 140);
  doc.text(`Grau de Risco: ${company.metadata?.risk_grade || "Não classificado"}`, 20, 150);
  
  // Units
  if (company.metadata?.units && company.metadata.units.length > 0) {
    doc.text("Unidades:", 20, 170);
    company.metadata.units.forEach((unit, index) => {
      doc.text(`${unit.fantasy_name || `Unidade ${index + 1}`} (${unit.code || 'N/A'})`, 30, 180 + (index * 10));
    });
  }
  
  doc.save(`empresa_${company.cnpj}.pdf`);
};

export const generateChecklistPDF = async (checklist: Checklist) => {
  try {
    const doc = new jsPDF();
    
    // Get checklist items
    const { data: items } = await supabase
      .from("checklist_itens")
      .select("*")
      .eq("checklist_id", checklist.id)
      .order("ordem", { ascending: true });
    
    // Header
    doc.setFontSize(18);
    doc.text(`Checklist: ${checklist.title}`, 20, 20);
    
    // Description
    if (checklist.description) {
      doc.setFontSize(12);
      doc.text(`Descrição: ${checklist.description}`, 20, 30);
    }
    
    // Metadata
    const metaY = checklist.description ? 40 : 30;
    doc.setFontSize(10);
    doc.text(`Categoria: ${checklist.category || 'Não especificada'}`, 20, metaY);
    doc.text(`Status: ${checklist.status_checklist}`, 20, metaY + 6);
    doc.text(`Tipo: ${checklist.is_template ? 'Modelo' : 'Checklist'}`, 20, metaY + 12);
    
    // Items
    let itemY = metaY + 24;
    doc.setFontSize(14);
    doc.text("Itens do Checklist:", 20, itemY);
    itemY += 10;
    
    if (items && items.length > 0) {
      doc.setFontSize(11);
      
      items.forEach((item, index) => {
        // Check if we need a new page
        if (itemY > 270) {
          doc.addPage();
          itemY = 20;
        }
        
        doc.text(`${index + 1}. ${item.pergunta}`, 20, itemY);
        itemY += 6;
        
        doc.setFontSize(9);
        doc.text(`Tipo de resposta: ${item.tipo_resposta}`, 25, itemY);
        itemY += 5;
        
        doc.text(`Obrigatório: ${item.obrigatorio ? 'Sim' : 'Não'}`, 25, itemY);
        itemY += 5;
        
        if (item.opcoes) {
          try {
            const options = typeof item.opcoes === 'string' 
              ? JSON.parse(item.opcoes) 
              : item.opcoes;
              
            if (Array.isArray(options) && options.length > 0) {
              doc.text(`Opções: ${options.join(', ')}`, 25, itemY);
              itemY += 5;
            }
          } catch (e) {
            console.error("Error parsing options:", e);
          }
        }
        
        doc.setFontSize(11);
        itemY += 5;
      });
    } else {
      doc.text("Nenhum item encontrado", 20, itemY);
    }
    
    // Add page numbers
    const pageCount = doc.internal.pages.length - 1; // Fixed: use pages.length instead of getNumberOfPages
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`checklist_${checklist.id}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating checklist PDF:", error);
    throw error;
  }
};

export const exportAllCompaniesReport = async () => {
  // Fetch all active companies
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .eq('status', 'active');

  if (error || !companies) {
    console.error("Erro ao buscar empresas:", error);
    return;
  }

  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;

  // Title
  doc.setFontSize(16);
  doc.text("Relatório Geral de Empresas", 20, yPosition);
  yPosition += 20;

  // Companies
  doc.setFontSize(10);
  companies.forEach((company, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Company header
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${company.fantasy_name}`, 20, yPosition);
    yPosition += 10;

    // Company details
    doc.setFont(undefined, 'normal');
    doc.text(`CNPJ: ${formatCNPJ(company.cnpj)}`, 25, yPosition);
    yPosition += 5;
    doc.text(`CNAE: ${company.cnae || "Não informado"}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Funcionários: ${company.employee_count || "Não informado"}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Contato: ${company.contact_name || "Não informado"}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Email: ${company.contact_email || "Não informado"}`, 25, yPosition);
    yPosition += 15; // Extra space between companies
  });

  // Save the PDF
  doc.save('relatorio_empresas.pdf');
};

export const exportAllChecklistsReport = async () => {
  // Fetch all checklists
  const { data: checklists, error } = await supabase
    .from('checklists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !checklists) {
    console.error("Erro ao buscar checklists:", error);
    return;
  }

  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;

  // Title
  doc.setFontSize(16);
  doc.text("Relatório de Listas de Verificação", 20, yPosition);
  yPosition += 20;

  // Checklists
  doc.setFontSize(10);
  checklists.forEach((checklist, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Checklist header
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${checklist.title}`, 20, yPosition);
    yPosition += 10;

    // Checklist details
    doc.setFont(undefined, 'normal');
    if (checklist.description) {
      doc.text(`Descrição: ${checklist.description}`, 25, yPosition);
      yPosition += 5;
    }
    doc.text(`Categoria: ${checklist.category || "Não especificada"}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Status: ${checklist.status_checklist}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Tipo: ${checklist.is_template ? 'Modelo' : 'Checklist'}`, 25, yPosition);
    yPosition += 15; // Extra space between checklists
  });

  // Save the PDF
  doc.save('relatorio_checklists.pdf');
};
