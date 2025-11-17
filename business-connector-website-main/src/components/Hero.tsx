import { ReactNode } from "react";

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundUrl?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  chips?: Array<{ label: string; onClick: () => void }>;
  ctas?: Array<{ label: string; onClick: () => void; variant?: "primary" | "outline" }>;
  extra?: ReactNode;
}

export default function Hero({
  title,
  subtitle,
  backgroundUrl = "/hero-bg.jpg",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  chips = [],
  ctas = [],
  extra,
}: HeroProps) {
  return (
    <section className="relative isolate">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/40" />

      <div className="max-w-[1200px] mx-auto px-4 py-20 md:py-28 text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 md:mt-4 text-lg md:text-xl text-white/90 max-w-3xl">
            {subtitle}
          </p>
        )}

        {/* Search bar */}
        <div className="mt-6 md:mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search city, neighborhood, or ZIP"
            className="w-full md:flex-1 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSearchSubmit}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold shadow"
          >
            Search
          </button>
        </div>

        {/* Quick chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={chip.onClick}
                className="px-3 py-1.5 rounded-full bg-white/90 text-gray-900 text-sm hover:bg-white"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* CTAs */}
        {ctas.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {ctas.map((cta, i) => (
              <button
                key={i}
                onClick={cta.onClick}
                className={
                  cta.variant === "outline"
                    ? "px-5 py-2.5 rounded-lg border border-white/70 text-white hover:bg-white/10"
                    : "px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {cta.label}
              </button>
            ))}
          </div>
        )}

        {extra && <div className="mt-6">{extra}</div>}
      </div>
    </section>
  );
}
