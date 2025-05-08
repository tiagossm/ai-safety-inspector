
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgePriorityVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        high: "border-red-200 bg-red-100 text-red-700",
        medium: "border-amber-200 bg-amber-100 text-amber-700",
        low: "border-green-200 bg-green-100 text-green-700",
        default: "border-gray-200 bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgePriorityProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgePriorityVariants> {}

function BadgePriority({
  className,
  variant,
  ...props
}: BadgePriorityProps) {
  return (
    <div className={cn(badgePriorityVariants({ variant }), className)} {...props} />
  );
}

export { BadgePriority, badgePriorityVariants };
