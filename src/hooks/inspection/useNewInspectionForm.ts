
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

// Define ApprovalStatus type from Database Enums
type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export function useNewInspectionForm(checklistId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [companyId, setCompanyId] = useState<string>("");
  const [companyData, setCompanyData] = useState<any>(null);
  const [responsibleId, setResponsibleId] = useState<string>("");
  const [responsibleData, setResponsibleData] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [inspectionType, setInspectionType] = useState<string>("internal");
  const [priority, setPriority] = useState<string>("medium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch checklist data
  useEffect(() => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      navigate("/inspections");
      return;
    }
    
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        console.log("Fetching checklist with ID:", checklistId);
        
        const { data, error } = await supabase
          .from("checklists")
          .select("*, checklist_itens(*)")
          .eq("id", checklistId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          toast.error("Checklist não encontrado");
          navigate("/inspections");
          return;
        }
        
        setChecklist(data);
        
        // If checklist already has a company_id, pre-select it
        if (data.company_id) {
          // Fetch company data to populate fields
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", data.company_id)
            .single();
          
          if (!companyError && companyData) {
            setCompanyId(companyData.id);
            setCompanyData(companyData);
            setLocation(companyData.address || "");
          }
        }
        
      } catch (error) {
        console.error("Error fetching checklist:", error);
        toast.error("Erro ao carregar o checklist");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChecklist();
  }, [checklistId, navigate]);
  
  // Update location when company is selected
  useEffect(() => {
    if (companyData && companyData.address) {
      setLocation(companyData.address);
    }
  }, [companyData]);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!companyId) {
      newErrors.company = "Selecione uma empresa";
    }
    
    if (!companyData?.cnae) {
      newErrors.cnae = "CNAE é obrigatório";
    } else if (!/^\d{2}\.\d{2}-\d$/.test(companyData.cnae)) {
      newErrors.cnae = "CNAE deve estar no formato 00.00-0";
    }
    
    if (!responsibleId && !responsibleData) {
      newErrors.responsible = "Selecione um responsável";
    }
    
    // Validate checklist_id is a valid UUID
    if (!checklistId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(checklistId)) {
      newErrors.checklist = "ID do checklist inválido";
    }
    
    // Validate company_id is a valid UUID
    if (companyId && companyId !== "all" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
      newErrors.company = "ID da empresa inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return companyId && companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(companyData.cnae);
  };
  
  // Format CNAE to expected format
  const formatCNAE = (cnae: string) => {
    // Remove non-numeric characters
    const numericOnly = cnae.replace(/[^\d]/g, '');
    
    // Format to XX.XX-X
    if (numericOnly.length >= 5) {
      return `${numericOnly.substring(0, 2)}.${numericOnly.substring(2, 4)}-${numericOnly.substring(4, 5)}`;
    }
    
    return cnae; // Return original if cannot format
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Ensure checklistId is provided and valid
      if (!checklistId) {
        console.error("Missing checklist ID");
        toast.error("ID do checklist não fornecido");
        setSubmitting(false);
        return;
      }
      
      // Format CNAE properly
      const formattedCNAE = formatCNAE(companyData.cnae);
      console.log("Using formatted CNAE:", formattedCNAE);
      
      // Convert date to ISO string if it exists
      const formattedDate = scheduledDate ? scheduledDate.toISOString() : null;
      console.log("Using formatted date:", formattedDate);
      
      // Prepare the inspection data
      const inspectionData = {
        checklist_id: checklistId,
        user_id: user.id,
        company_id: companyId,
        cnae: formattedCNAE,
        status: "Pendente",
        approval_status: "pending" as ApprovalStatus,
        responsible_id: responsibleId || null,
        scheduled_date: formattedDate,
        location: location || "",
        inspection_type: inspectionType || "internal",
        priority: priority || "medium",
        metadata: {
          notes: notes || "",
          responsible_data: responsibleId ? null : responsibleData,
        },
        checklist: {
          title: checklist.title,
          description: checklist.description || "",
          total_questions: checklist?.checklist_itens?.length || 0,
        }
      };
      
      console.log("Sending inspection data:", inspectionData);
      
      // Create inspection
      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Inspection created successfully:", inspection);
      toast.success("Inspeção criada com sucesso!");
      navigate(`/inspections/${inspection.id}/view`);
      
    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle company selection
  const handleCompanySelect = (id: string, data: any) => {
    setCompanyId(id);
    
    // Se temos dados da empresa, usamos eles
    if (data) {
      setCompanyData(data);
      if (data.address) {
        setLocation(data.address);
      }
      
      // Clear CNAE error if valid
      if (data.cnae && /^\d{2}\.\d{2}-\d$/.test(data.cnae)) {
        setErrors(prev => ({...prev, cnae: ""}));
      }
    }
    // Se não temos dados e o ID é válido, precisamos buscar
    else if (id && id !== "all" && id !== "loading") {
      // Buscar dados da empresa selecionada
      supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setCompanyData(data);
            if (data.address) {
              setLocation(data.address);
            }
          } else {
            console.error("Error fetching company data:", error);
          }
        });
    } else {
      // Limpar dados se nenhuma empresa ou opção "all" foi selecionada
      setCompanyData(null);
    }
  };
  
  // Handle responsible selection
  const handleResponsibleSelect = (id: string, data: any) => {
    setResponsibleId(id);
    setResponsibleData(data);
    setErrors(prev => ({...prev, responsible: ""}));
  };

  return {
    checklist,
    loading,
    submitting,
    companyId,
    companyData,
    responsibleId,
    responsibleData,
    scheduledDate,
    location,
    notes,
    inspectionType,
    priority,
    errors,
    setCompanyData,
    setLocation,
    setNotes,
    setInspectionType,
    setPriority,
    setScheduledDate,
    handleCompanySelect,
    handleResponsibleSelect,
    handleSubmit,
    isFormValid
  };
}
