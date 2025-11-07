"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

interface SingleSelectButtonGroupProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  legend?: string; // optional for accessibility
}

export function SingleSelectButtonGroup({
  options,
  value,
  onChange,
  className,
  legend = "Select an option",
}: SingleSelectButtonGroupProps) {
  return (
    <fieldset
      className={cn("flex flex-col items-start gap-2 rounded-md", className)}
    >
      <legend className="sr-only">{legend}</legend>

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            className={cn(
              "w-full max-w-xs justify-start rounded-md px-3 py-2 transition-all",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5",
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            title={option.label}
          >
            <span
              className={cn(
                "mr-2 h-3.5 w-3.5 rounded-full border-2 transition-all",
                isActive
                  ? "border-blue-600 bg-blue-600"
                  : "border-muted-foreground",
              )}
            />
            <span className="truncate whitespace-nowrap overflow-hidden">
              {option.label}
            </span>
          </Button>
        );
      })}
    </fieldset>
  );
}
