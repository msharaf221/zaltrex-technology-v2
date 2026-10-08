import Link from "next/link";

export function ZMark({
  className = "",
  variant = "gradient",
}: {
  className?: string;
  variant?: "gradient" | "solid" | "white";
}) {
  return (
    <svg
      viewBox="0 0 400 370"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="zmark-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
        <linearGradient id="zmark-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0077FF" />
          <stop offset="100%" stopColor="#0044EE" />
        </linearGradient>
        <linearGradient id="zmark-g3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0055FF" />
        </linearGradient>
      </defs>
      {/* Top Bar */}
      <path
        d="M77 0 H381 L199 180 V72 H7 L77 0 Z"
        fill={
          variant === "white"
            ? "#FFFFFF"
            : variant === "solid"
              ? "currentColor"
              : "url(#zmark-g1)"
        }
      />
      {/* Middle Diagonal */}
      <path
        d="M175 113 V204 L8 369 V279 L175 113 Z"
        fill={
          variant === "white"
            ? "#FFFFFF"
            : variant === "solid"
              ? "currentColor"
              : "url(#zmark-g2)"
        }
      />
      {/* Bottom Bar and Parallel Slash */}
      <path
        d="M381 38 V73 L167 287 H392 L324 355 H131 L97 321 L381 38 Z"
        fill={
          variant === "white"
            ? "#FFFFFF"
            : variant === "solid"
              ? "currentColor"
              : "url(#zmark-g3)"
        }
      />
    </svg>
  );
}

export function Brand({
  light = false,
  showTagline = false,
  size = "md",
}: {
  light?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize =
    size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8";

  return (
    <Link
      href="/"
      aria-label="Zaltrex Technology"
      dir="ltr"
      className={`brand ${light ? "brand-light" : ""} brand-${size}`}
    >
      <span className="brand-icon">
        <ZMark className={iconSize} />
      </span>
      <span className="brand-text-block">
        <span className="brand-title">
          ZALTRE<span className="brand-x">X</span>
        </span>
        <span className="brand-subtitle">TECHNOLOGY</span>
        {showTagline && (
          <span className="brand-tagline">Innovate. Integrate. Elevate.</span>
        )}
      </span>
    </Link>
  );
}
