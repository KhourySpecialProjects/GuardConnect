"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Option = {
  label: string;
  value: string;
};

interface SingleSelectButtonGroupProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SingleSelectButtonGroup({
  options,
  value,
  onChange,
  className,
}: SingleSelectButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-md",
        className
      )}
      role="group"
    >
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
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
            onClick={() => onChange(option.value)}
            title={option.label}
          >
            <span
              className={cn(
                "mr-2 h-3.5 w-3.5 rounded-full border-2 transition-all",
                isActive
                  ? "border-blue-600 bg-blue-600"
                  : "border-muted-foreground"
              )}
            />
            <span className="truncate whitespace-nowrap overflow-hidden">
              {option.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
