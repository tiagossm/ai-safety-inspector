
import { forwardRef } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          className,
          hasError && "border-destructive focus-visible:ring-destructive"
        )}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
