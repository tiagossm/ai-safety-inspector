
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

export function useNewInspectionForm(checklistId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);

  const hasFetched = useRef(false);
  
  // Check for session storage for already submitted inspections
  useEffect(() => {
    if (!checklistId) return;
    
    const formSubmissionKey = `inspection_submitted_${checklistId}`;
    const wasSubmitted = sessionStorage.getItem(formSubmissionKey) === "true";
    const savedId = sessionStorage.getItem("last_created_inspection_id");
    
    if (wasSubmitted && savedId) {
      console.log(`This inspection was already created (ID: ${savedId}). Redirecting...`);
      setCreatedInspectionId(savedId);
      setHasSubmitted(true);
      navigate(`/inspections/${savedId}/view`, { replace: true });
    }
  }, [checklistId, navigate]);

  useEffect(() => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      navigate("/inspections");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchChecklist = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("checklists")
          .select("*, checklist_itens(*)")
          .eq("id", checklistId)
          .single();

        if (error || !data) {
          toast.error("Checklist não encontrado ou erro ao buscar dados");
          navigate("/inspections");
          return;
        }

        setChecklist(data);

        if (data.company_id) {
          const { data: companyData } = await supabase
            .from("companies")
            .select("*")
            .eq("id", data.company_id)
            .single();

          if (companyData) {
            setCompanyId(companyData.id);
            setCompanyData(companyData);
            setLocation(companyData.address || "");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar checklist:", error);
        toast.error("Erro ao carregar checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistId, navigate]);

  useEffect(() => {
    if (companyData?.address) {
      setLocation(companyData.address);
    }
  }, [companyData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!companyId) newErrors.company = "Selecione uma empresa";
    if (!companyData?.cnae) newErrors.cnae = "CNAE é obrigatório";
    else if (!/^\d{2}\.\d{2}-\d$/.test(companyData.cnae)) newErrors.cnae = "CNAE deve estar no formato 00.00-0";
    if (!responsibleId && !responsibleData) newErrors.responsible = "Selecione um responsável";
    if (!checklistId || !/^[0-9a-f\-]{36}$/i.test(checklistId)) newErrors.checklist = "ID do checklist inválido";
    if (companyId && !/^[0-9a-f\-]{36}$/i.test(companyId)) newErrors.company = "ID da empresa inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return companyId && companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(companyData.cnae);
  };

  const formatCNAE = (cnae: string) => {
    const numericOnly = cnae.replace(/[^\d]/g, '');
    if (numericOnly.length >= 5) {
      return `${numericOnly.substring(0, 2)}.${numericOnly.substring(2, 4)}-${numericOnly.substring(4, 5)}`;
    }
    return cnae;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check for existing inspection in session storage
    const formSubmissionKey = `inspection_submitted_${checklistId}`;
    const wasSubmitted = sessionStorage.getItem(formSubmissionKey) === "true";
    const savedId = sessionStorage.getItem("last_created_inspection_id");
    
    if (wasSubmitted && savedId) {
      console.log(`This inspection was already created (ID: ${savedId}). Redirecting...`);
      navigate(`/inspections/${savedId}/view`, { replace: true });
      return true;
    }

    // Or check component state
    if (hasSubmitted || createdInspectionId) {
      console.log("Form already submitted, preventing duplicate submission");
      if (createdInspectionId) {
        navigate(`/inspections/${createdInspectionId}/view`, { replace: true });
      }
      return false;
    }

    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      setSubmitting(true);
      setHasSubmitted(true);

      const formattedCNAE = formatCNAE(companyData.cnae);
      const formattedDate = scheduledDate ? scheduledDate.toISOString() : null;

      const inspectionData = {
        checklist_id: checklistId,
        user_id: user.id,
        company_id: companyId,
        cnae: formattedCNAE,
        status: "pending",
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
          total_questions: Array.isArray(checklist?.checklist_itens) ? checklist.checklist_itens.length : 0
        }
      };

      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;

      // Save inspection ID to session storage to prevent duplicate submissions
      if (inspection?.id) {
        sessionStorage.setItem(formSubmissionKey, "true");
        sessionStorage.setItem("last_created_inspection_id", inspection.id);
        setCreatedInspectionId(inspection.id);
      }

      toast.success("Inspeção criada com sucesso!");
      console.log(`Navigating to inspection ${inspection.id} view page`);
      
      // Use replace to prevent back navigation to form
      navigate(`/inspections/${inspection.id}/view`, { replace: true });
      return true;

    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
      setHasSubmitted(false);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanySelect = (id: string, data: any) => {
    setCompanyId(id);
    setCompanyData(data);
    if (data.address) setLocation(data.address);
    if (data.cnae && /^\d{2}\.\d{2}-\d$/.test(data.cnae)) {
      setErrors(prev => ({ ...prev, cnae: "" }));
    }
  };

  const handleResponsibleSelect = (id: string, data: any) => {
    setResponsibleId(id);
    setResponsibleData(data);
    setErrors(prev => ({ ...prev, responsible: "" }));
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
    createdInspectionId,
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
