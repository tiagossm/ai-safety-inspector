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

  useEffect(() => {
    if (!checklistId) {
      toast.error("ID do checklist não fornecido");
      navigate("/inspections");
      return;
    }

    const fetchChecklist = async () => {
      try {
        setLoading(true);
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

        if (data.company_id) {
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
      const formattedCNAE = formatCNAE(companyData.cnae);
      const formattedDate = scheduledDate ? scheduledDate.toISOString() : null;

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
          total_questions: Array.isArray(checklist?.checklist_itens) ? checklist.checklist_itens.length : 0
        }
      };

      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Inspeção criada com sucesso!");
      navigate(`/inspections/${inspection.id}/view`);

    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(`Erro ao criar inspeção: ${error.message}`);
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
