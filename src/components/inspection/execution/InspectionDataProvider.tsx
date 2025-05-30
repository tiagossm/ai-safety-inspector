
import React, { createContext, useContext } from "react";
import { useInspectionData, InspectionDataHook } from "@/hooks/inspection/useInspectionData";

// Criar contexto para dados de inspeção
const InspectionDataContext = createContext<InspectionDataHook | null>(null);

export interface InspectionDataProviderProps {
  inspectionId: string | undefined;
  children: React.ReactNode;
}

export const InspectionDataProvider: React.FC<InspectionDataProviderProps> = ({ 
  inspectionId, 
  children 
}) => {
  const inspectionData = useInspectionData(inspectionId);
  
  return (
    <InspectionDataContext.Provider value={inspectionData}>
      {children}
    </InspectionDataContext.Provider>
  );
};

// Hook para usar o contexto de dados da inspeção
export const useInspectionDataContext = (): InspectionDataHook => {
  const context = useContext(InspectionDataContext);
  
  if (!context) {
    throw new Error("useInspectionDataContext deve ser usado dentro de um InspectionDataProvider");
  }
  
  return context;
};
