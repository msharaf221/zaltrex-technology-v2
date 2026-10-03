export function HeroArt() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[430px]">
      <svg viewBox="0 0 440 430" className="h-auto w-full" fill="none">
        <defs>
          <pattern
            id="hero-grid"
            width="35"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path d="M35 0H0V35" stroke="#EFF3FA" strokeWidth="1" />
          </pattern>
          <linearGradient
            id="cube-top"
            x1="190"
            y1="160"
            x2="280"
            y2="205"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient
            id="cube-left"
            x1="155"
            y1="200"
            x2="220"
            y2="310"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <rect x="30" y="25" width="380" height="380" rx="30" fill="#F8FAFF" />
        <rect
          x="30"
          y="25"
          width="380"
          height="380"
          rx="30"
          fill="url(#hero-grid)"
        />
        <ellipse cx="220" cy="319" rx="75" ry="18" fill="#E8EFFF" />
        <path
          d="M220 75L347 149V296L220 370L93 296V149L220 75Z"
          stroke="#DBE7FD"
          strokeDasharray="4 5"
        />
        <path
          d="M220 75V158M347 149L282 187M347 296L282 258M220 370V298M93 296L157 258M93 149L157 187"
          stroke="#D1DFFD"
        />
        <path
          d="M220 152L286 190L220 229L154 190L220 152Z"
          fill="url(#cube-top)"
        />
        <path d="M154 190L220 229V305L154 266V190Z" fill="url(#cube-left)" />
        <path d="M286 190L220 229V305L286 266V190Z" fill="#1E40AF" />
        <path
          d="M185 182L220 162L256 182M164 204V258L208 284M277 205V258L231 285"
          stroke="white"
          strokeOpacity=".2"
          strokeWidth="1.5"
        />
        <path
          d="M190 181L229 181L203 197L242 197"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="bevel"
        />
        <rect
          x="202"
          y="57"
          width="36"
          height="36"
          rx="9"
          fill="white"
          stroke="#DBE7FD"
        />
        <path
          d="M213 75L218 80L227 70"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="329"
          y="131"
          width="36"
          height="36"
          rx="9"
          fill="white"
          stroke="#DBE7FD"
        />
        <path
          d="M340 149H354M347 142V156"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="75"
          y="278"
          width="36"
          height="36"
          rx="9"
          fill="white"
          stroke="#DBE7FD"
        />
        <path
          d="M88 291L83 296L88 301M98 291L103 296L98 301"
          stroke="#2563EB"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="93" cy="149" r="5" fill="#BFDBFE" />
        <circle cx="347" cy="296" r="5" fill="#BFDBFE" />
        <circle cx="220" cy="370" r="5" fill="#BFDBFE" />
        <rect
          x="275"
          y="328"
          width="108"
          height="38"
          rx="8"
          fill="white"
          stroke="#E2E8F0"
        />
        <circle cx="293" cy="347" r="3" fill="#2563EB" />
        <path
          d="M305 342H365M305 350H343"
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-1 text-center text-[10px] font-medium tracking-[0.18em] text-slate-400 uppercase">
        Clarity. Connection. Possibility.
      </p>
    </div>
  );
}
