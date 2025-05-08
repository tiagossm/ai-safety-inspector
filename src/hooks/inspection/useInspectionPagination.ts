
import { useState } from "react";
import { InspectionDetails } from "@/types/newChecklist";

interface UseInspectionPaginationParams {
  inspections: InspectionDetails[];
  defaultPageSize?: number;
}

export function useInspectionPagination({ 
  inspections,
  defaultPageSize = 10 
}: UseInspectionPaginationParams) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = inspections.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is valid when total pages changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Calculate paginated data
  const paginatedInspections = inspections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    const validPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validPage);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    
    // Adjust current page if necessary
    const newTotalPages = Math.max(1, Math.ceil(totalItems / size));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedInspections,
    handlePageChange,
    handlePageSizeChange
  };
}
