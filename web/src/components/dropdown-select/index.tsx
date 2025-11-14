"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DropdownSelect = ({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleOpenChange = (open: boolean) => {
    if (open && triggerRef.current) {
      triggerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Select value={value} onValueChange={onChange} onOpenChange={handleOpenChange}>
      <SelectTrigger
        ref={triggerRef}
        className="w-full text-subheader font-semibold py-3 rounded-xl bg-white border border-primary hover:bg-primary hover:text-white"
      >
        <SelectValue placeholder={options.length > 0 ? options[0].label : "Select an option"} />
      </SelectTrigger>

      {mounted && (
        <SelectPortal container={document.body}>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            className="w-[var(--radix-select-trigger-width)] border border-primary rounded-b-xl bg-white"
          >
            <SelectGroup>
              {options.map((option, idx) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={`text-subheader font-semibold text-primary py-2 px-3 ${idx > 0 ? "border-t border-neutral" : ""}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      )}
    </Select>
  );
};
export default DropdownSelect;