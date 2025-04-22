
export function useFormValidation(formData: any, setFormErrors: (errors: Record<string, string>) => void) {
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyId) {
      errors.company = "Empresa é obrigatória";
    }
    if (formData.companyData?.cnae && !/^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae)) {
      errors.cnae = "CNAE deve estar no formato 00.00-0";
    }
    if (!formData.responsibleId) {
      errors.responsible = "Responsável é obrigatório";
    }
    if (!formData.location && !formData.coordinates) {
      errors.location = "Localização é obrigatória";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    return true;
  };

  return { validateForm };
}
