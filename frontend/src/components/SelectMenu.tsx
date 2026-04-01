import { Check } from "lucide-react";
import { Dropdown, DropdownItem, type Align } from "./Dropdown";

export type SelectOption = { value: string; label: string };

type SelectMenuProps = {
  id?: string;
  "aria-label"?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  align?: Align;
  className?: string;
};

export function SelectMenu({
  id,
  "aria-label": ariaLabel,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  align = "left",
  className,
}: SelectMenuProps) {
  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  return (
    <Dropdown
      label={label}
      align={align}
      disabled={disabled}
      className={className}
      buttonClassName="w-full max-w-none justify-between sm:max-w-none"
      matchMenuWidth
      triggerId={id}
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <DropdownItem
          key={o.value === "" ? "__empty" : o.value}
          selected={o.value === value}
          onClick={() => onChange(o.value)}
        >
          <span className="flex w-full items-center justify-between gap-2">
            <span>{o.label}</span>
            {o.value === value && (
              <Check
                className="h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden
                strokeWidth={2.5}
              />
            )}
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
