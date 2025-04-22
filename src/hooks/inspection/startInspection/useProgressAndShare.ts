
export function useProgressAndShare(formData: any) {
  const getFormProgress = (): number => {
    let totalFields = 5;
    let completedFields = 0;
    if (formData.companyId) completedFields++;
    if (formData.companyData?.cnae && /^\d{2}\.\d{2}-\d$/.test(formData.companyData.cnae)) completedFields++;
    if (formData.responsibleId) completedFields++;
    if (formData.location || formData.coordinates) completedFields++;
    if (formData.inspectionType) completedFields++;
    return Math.floor((completedFields / totalFields) * 100);
  };

  const generateShareableLink = (inspectionId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/inspections/${inspectionId}/shared`;
  };

  return { getFormProgress, generateShareableLink };
}
