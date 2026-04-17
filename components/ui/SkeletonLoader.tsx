import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded bg-surface-2/70",
        className,
      )}
    />
  );
}
