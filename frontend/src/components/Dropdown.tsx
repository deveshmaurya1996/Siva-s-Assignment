import { ChevronDown } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DropdownCloseContext = createContext<(() => void) | null>(null);

export type Align = "left" | "right";

export type DropdownProps = {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  align?: Align;
  disabled?: boolean;
  buttonClassName?: string;
  className?: string;
  matchMenuWidth?: boolean;
  triggerId?: string;
  "aria-label"?: string;
};

export function Dropdown({
  label,
  description,
  children,
  align = "right",
  disabled = false,
  buttonClassName = "",
  className = "",
  matchMenuWidth = false,
  triggerId: triggerIdProp,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = () => setOpen(false);
  const triggerId = triggerIdProp ?? `${menuId}-trigger`;

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const defaultBtn =
    "flex max-w-[min(100%,16rem)] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 py-1.5 pl-2.5 pr-0.5 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs";

  return (
    <div className={`relative ${className}`.trim()} ref={ref}>
      <button
        type="button"
        id={triggerId}
        className={`${defaultBtn} ${buttonClassName}`.trim()}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? `${menuId}-menu` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{label}</span>
          {description != null && (
            <span className="block truncate text-xs text-slate-400">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && !disabled && (
        <div
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={triggerId}
          className={`absolute top-full z-50 mt-1.5 ${
            matchMenuWidth
              ? "left-0 right-0 w-full min-w-0"
              : align === "right"
                ? "right-0 min-w-48"
                : "left-0 min-w-48"
          }`}
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain rounded-lg border border-slate-700/90 bg-slate-900 py-1 shadow-xl ring-1 ring-black/40">
            <DropdownCloseContext.Provider value={close}>
              {children}
            </DropdownCloseContext.Provider>
          </div>
        </div>
      )}
    </div>
  );
}

export type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  selected?: boolean;
};

export function DropdownItem({
  children,
  onClick,
  icon,
  destructive,
  selected,
}: DropdownItemProps) {
  const closeMenu = useContext(DropdownCloseContext);

  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-800 ${
        destructive ? "text-red-400 hover:text-red-300" : "text-slate-200"
      } ${selected ? "bg-slate-800/60" : ""}`}
      onClick={() => {
        onClick?.();
        closeMenu?.();
      }}
    >
      {icon != null && (
        <span className="shrink-0 text-slate-400 [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
