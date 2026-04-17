import clsx from "clsx";
import type { TypeName } from "@/lib/types";
import { TYPE_BG_CLASS } from "@/lib/theme";

export function TypePill({
  type,
  size = "sm",
  className,
}: {
  type: TypeName;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizing =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5"
      : size === "md"
        ? "text-xs px-2.5 py-1"
        : "text-[11px] px-2 py-0.5";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium uppercase tracking-wide",
        TYPE_BG_CLASS[type],
        sizing,
        className,
      )}
    >
      {type}
    </span>
  );
}
