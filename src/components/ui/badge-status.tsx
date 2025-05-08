
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStatusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        completed: "bg-green-100 text-green-700 border border-green-200",
        inProgress: "bg-blue-100 text-blue-700 border border-blue-200",
        pending: "bg-amber-100 text-amber-700 border border-amber-200",
        default: "bg-gray-100 text-gray-800 border border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeStatusVariants> {}

function BadgeStatus({
  className,
  variant,
  ...props
}: BadgeStatusProps) {
  return (
    <div className={cn(badgeStatusVariants({ variant }), className)} {...props} />
  );
}

export { BadgeStatus, badgeStatusVariants };
