
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const dataCardVariants = cva(
  "overflow-hidden transition-all hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-white border border-border",
        filled: "bg-muted/50",
        highlight: "bg-white border border-primary/20 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface DataCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataCardVariants> {
  asChild?: boolean;
}

const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    if (asChild) {
      // Just return the children directly, without any wrapper
      return <div className={cn(dataCardVariants({ variant, className }))} ref={ref} {...props} />;
    }
    
    // Use Card component normally
    return (
      <Card className={cn(dataCardVariants({ variant, className }))} ref={ref} {...props} />
    );
  }
);

DataCard.displayName = "DataCard";

export { DataCard, dataCardVariants };
