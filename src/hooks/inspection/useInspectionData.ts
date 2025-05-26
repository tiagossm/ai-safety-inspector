
import { useState, useEffect } from "react";
import { useInspectionFetch } from "./useInspectionFetch";

export function useInspectionData(inspectionId: string | undefined) {
  const {
    loading,
    error,
    inspection,
    questions,
    responses,
    company,
    responsible
  } = useInspectionFetch(inspectionId);

  return {
    loading,
    error,
    inspection,
    questions,
    responses,
    company,
    responsible
  };
}
