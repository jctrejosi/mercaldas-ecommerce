export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-1 select-none">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg leading-none"
        style={{
          background: "#FFF200",
          color: "#1A1A2E",
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}
      >
        M
      </div>
      <span
        className="font-black text-xl tracking-tight leading-none"
        style={{
          color: dark ? "#1A1A2E" : "#ffffff",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        ERCALDAS
      </span>
    </div>
  );
}
