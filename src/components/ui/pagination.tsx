
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

interface PaginationProps {
  page: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, total, onPageChange, className }: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const showMax = 5; // Maximum number of pages to show
    
    if (total <= showMax) {
      // Show all pages if total is less than or equal to showMax
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of the middle section
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(total - 1, page + 1);
      
      // Adjust if we're near the start
      if (page <= 3) {
        endPage = 4;
      }
      
      // Adjust if we're near the end
      if (page >= total - 2) {
        startPage = total - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(-1); // Use -1 to represent ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < total - 1) {
        pageNumbers.push(-2); // Use -2 to represent ellipsis
      }
      
      // Always show last page
      pageNumbers.push(total);
    }
    
    return pageNumbers;
  };
  
  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };
  
  const handleNext = () => {
    if (page < total) {
      onPageChange(page + 1);
    }
  };

  return (
    <nav
      className={cn("flex w-full justify-center items-center space-x-2 mt-4", className)}
    >
      <button
        className={buttonVariants({ variant: "outline", size: "sm" })}
        onClick={handlePrevious}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </button>
      
      <div className="flex space-x-1">
        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber < 0) {
            // Render ellipsis
            return (
              <div 
                key={`ellipsis-${index}`}
                className="flex items-center justify-center h-9 w-9"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            );
          }
          
          // Render page number button
          return (
            <button
              key={pageNumber}
              className={cn(
                buttonVariants({ 
                  variant: page === pageNumber ? "default" : "outline", 
                  size: "sm" 
                }),
                "h-9 w-9 p-0"
              )}
              onClick={() => onPageChange(pageNumber)}
              disabled={page === pageNumber}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      <button
        className={buttonVariants({ variant: "outline", size: "sm" })}
        onClick={handleNext}
        disabled={page >= total}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </button>
    </nav>
  );
}
