
import { Company } from "@/types/company";
import { jsPDF } from "jspdf";
import { formatCNPJ } from "./formatters";

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
