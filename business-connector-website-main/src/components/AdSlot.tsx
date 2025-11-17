import clsx from "clsx";

export default function AdSlot({ variant = "banner", className = "" }: { variant?: "banner" | "sidebar" | "inline"; className?: string }) {
  const base = "bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm rounded";
  if (variant === "banner") {
    return <div className={clsx(base, "h-20 w-full", className)}>Ad Space (728x90)</div>;
  }
  if (variant === "sidebar") {
    return <div className={clsx(base, "w-full h-64", className)}>Ad Space (300x600)</div>;
  }
  return <div className={clsx(base, "w-full h-24", className)}>Ad Space</div>;
}
