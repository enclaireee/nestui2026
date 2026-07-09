import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface RegistrationInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const RegistrationInput = React.forwardRef<
  HTMLInputElement,
  RegistrationInputProps
>(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-full border-none bg-white/90 px-4 py-2 text-sm text-brand-green placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
});
RegistrationInput.displayName = "RegistrationInput";
