import Link from "next/link";

export function ZMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 9H24L9 23H24M9 15.5H15.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Zaltrex Technology"
      dir="ltr"
      className={`brand ${light ? "brand-light" : ""}`}
    >
      <span className="brand-icon">
        <ZMark className="size-8" />
      </span>
      <span>
        <span className="brand-title">
          ZALTREX<span className="brand-dot">.</span>
        </span>
        <span className="brand-subtitle">TECHNOLOGY</span>
      </span>
    </Link>
  );
}
