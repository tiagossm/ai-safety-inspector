
import { jsPDF } from "jspdf";
import { Company, CompanyUnit } from "@/types/company";

export const isMatriz = (cnpj: string) => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  return cleanCnpj.substring(8, 12) === '0001';
};

export const generatePDF = (company: Company, units: CompanyUnit[] | undefined) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text("Relatório da Empresa", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Nome: ${company.fantasy_name || "Não informado"}`, 20, 40);
  doc.text(`CNPJ: ${company.cnpj}`, 20, 50);
  doc.text(`CNAE: ${company.cnae || "Não informado"}`, 20, 60);
  doc.text(`Tipo: ${isMatriz(company.cnpj) ? "Matriz" : "Filial"}`, 20, 70);
  doc.text(`Funcionários: ${company.employee_count || "Não informado"}`, 20, 80);
  
  doc.text("Unidades:", 20, 100);
  units?.forEach((unit, index) => {
    doc.text(`- ${unit.name || `Unidade ${index + 1}`}`, 30, 110 + (index * 10));
  });
  
  doc.save(`relatorio_${company.cnpj}.pdf`);
};

export const generateCSV = (company: Company, units: CompanyUnit[] | undefined) => {
  let csvContent = "Nome,CNPJ,CNAE,Tipo,Funcionários\n";
  csvContent += `${company.fantasy_name || ""},${company.cnpj},${company.cnae || ""},${isMatriz(company.cnpj) ? "Matriz" : "Filial"},${company.employee_count || ""}\n`;
  
  units?.forEach(unit => {
    csvContent += `${unit.name || ""},${unit.id || ""},${unit.address || ""},"Unidade",\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `empresa_${company.cnpj}_relatorio.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
