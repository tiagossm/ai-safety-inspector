
import { Company } from "@/types/company";
import { jsPDF } from "jspdf";
import { formatCNPJ } from "./formatters";
import { supabase } from "@/integrations/supabase/client";

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
      doc.text(`${unit.name} (${unit.code})`, 30, 180 + (index * 10));
    });
  }
  
  doc.save(`empresa_${company.cnpj}.pdf`);
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
