
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ChecklistsPaginationProps {
  perPage: number;
  setPerPage: (perPage: number) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
}

export function ChecklistsPagination({
  perPage,
  setPerPage,
  page,
  setPage,
  total,
}: ChecklistsPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <Select
        value={perPage.toString()}
        onValueChange={(value) => setPerPage(Number(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Resultados por página" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 por página</SelectItem>
          <SelectItem value="20">20 por página</SelectItem>
          <SelectItem value="30">30 por página</SelectItem>
          <SelectItem value="50">50 por página</SelectItem>
        </SelectContent>
      </Select>
      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setPage(Math.max(page - 1, 1));
            }}
          />
          {page > 2 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}
          {page > 3 && <PaginationEllipsis />}
          {page > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(page - 1);
                }}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
              }}
              isActive
            >
              {page}
            </PaginationLink>
          </PaginationItem>
          {page < Math.ceil(total / perPage) && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < Math.ceil(total / perPage) - 2 && <PaginationEllipsis />}
          {page < Math.ceil(total / perPage) - 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(Math.ceil(total / perPage));
                }}
              >
                {Math.ceil(total / perPage)}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              setPage(Math.min(page + 1, Math.ceil(total / perPage)));
            }}
          />
        </PaginationContent>
      </Pagination>
    </div>
  );
}
