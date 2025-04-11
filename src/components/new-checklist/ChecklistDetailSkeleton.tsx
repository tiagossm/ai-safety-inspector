
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ChecklistDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <Skeleton className="h-6 w-40 mt-1" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categoria</p>
              <Skeleton className="h-6 w-32 mt-1" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Responsável</p>
              <Skeleton className="h-6 w-36 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Skeleton className="h-6 w-24 mt-1" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Criado em</p>
              <Skeleton className="h-6 w-32 mt-1" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de vencimento</p>
              <Skeleton className="h-6 w-32 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Questões do Checklist</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
