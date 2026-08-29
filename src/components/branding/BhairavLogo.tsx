export function BhairavLogo({ size = 240, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <clipPath id="shieldClip">
          <path d="M200 40 L340 90 L340 200 C340 280 280 340 200 360 C120 340 60 280 60 200 L60 90 Z" />
        </clipPath>
      </defs>

      {/* Outer thick black border */}
      <path
        d="M200 35 L345 87 L345 200 C345 282 282 342 200 362 C118 342 55 282 55 200 L55 87 Z"
        fill="#000000"
        stroke="#000000"
        strokeWidth="6"
      />

      {/* Shield interior */}
      <path
        d="M200 45 L330 92 L330 200 C330 275 275 333 200 352 C125 333 70 275 70 200 L70 92 Z"
        fill="#0B1017"
        stroke="#1a1f2e"
        strokeWidth="2"
      />

      {/* Inner gold accent line */}
      <path
        d="M200 52 L322 96 L322 200 C322 270 270 327 200 345 C130 327 78 270 78 200 L78 96 Z"
        fill="none"
        stroke="#c5a44e"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Eagle head group - centered */}
      <g transform="translate(200, 185)">
        {/* Neck/base shadow */}
        <ellipse cx="0" cy="45" rx="55" ry="35" fill="#0f1419" />

        {/* Feather layers - back */}
        <path d="M-50 20 Q-55 -10 -30 -35 Q-10 -50 0 -55 Q10 -50 30 -35 Q55 -10 50 20 Q45 35 30 40 Q10 45 0 45 Q-10 45 -30 40 Q-45 35 -50 20Z" fill="#1a1f2e" />
        
        {/* Main head shape */}
        <path d="M-45 15 Q-50 -15 -25 -40 Q-10 -55 0 -58 Q10 -55 25 -40 Q50 -15 45 15 Q40 30 25 38 Q10 42 0 42 Q-10 42 -25 38 Q-40 30 -45 15Z" fill="#e8e8e8" />

        {/* Forehead/beret base */}
        <path d="M-40 5 Q-45 -20 -20 -45 Q0 -60 20 -45 Q45 -20 40 5 Q35 15 20 20 Q0 22 -20 20 Q-35 15 -40 5Z" fill="#4a5d23" />

        {/* Beret detail - left side */}
        <path d="M-40 5 Q-48 -18 -22 -42 Q-8 -55 0 -57 L0 -45 Q-10 -43 -22 -30 Q-35 -15 -38 5Z" fill="#3d4f1c" />

        {/* Beret detail - right side */}
        <path d="M40 5 Q48 -18 22 -42 Q8 -55 0 -57 L0 -45 Q10 -43 22 -30 Q35 -15 38 5Z" fill="#5a6f2e" />

        {/* Beret band */}
        <path d="M-42 8 Q-46 -12 -24 -38 Q-10 -52 0 -54 L0 -48 Q-8 -46 -22 -32 Q-36 -18 -40 8Z" fill="#2a3512" opacity="0.5" />

        {/* Gold star insignia on beret */}
        <g transform="translate(0, -22)">
          <polygon points="0,-8 2.3,-2.5 8,-2.5 3.5,1.8 5.5,7.5 0,3.8 -5.5,7.5 -3.5,1.8 -8,-2.5 -2.3,-2.5" fill="#d4a843" stroke="#b8922e" strokeWidth="0.8" />
        </g>

        {/* Brow ridge - fierce expression */}
        <path d="M-35 -5 Q-25 -12 -10 -10 Q0 -8 10 -10 Q25 -12 35 -5" stroke="#0f1419" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Left eye socket */}
        <ellipse cx="-14" cy="-2" rx="9" ry="6" fill="#0f1419" />
        {/* Left eye */}
        <ellipse cx="-14" cy="-2" rx="7" ry="5" fill="#d4a843" />
        {/* Left pupil */}
        <ellipse cx="-14" cy="-2" rx="3.5" ry="3.5" fill="#0f1419" />
        {/* Left eye highlight */}
        <ellipse cx="-16" cy="-4" rx="1.8" ry="1.5" fill="#ffffff" opacity="0.9" />

        {/* Right eye socket */}
        <ellipse cx="14" cy="-2" rx="9" ry="6" fill="#0f1419" />
        {/* Right eye */}
        <ellipse cx="14" cy="-2" rx="7" ry="5" fill="#d4a843" />
        {/* Right pupil */}
        <ellipse cx="14" cy="-2" rx="3.5" ry="3.5" fill="#0f1419" />
        {/* Right eye highlight */}
        <ellipse cx="12" cy="-4" rx="1.8" ry="1.5" fill="#ffffff" opacity="0.9" />

        {/* Beak upper */}
        <path d="M-6 8 Q-8 18 -4 28 Q0 32 4 28 Q8 18 6 8 Q3 6 0 6 Q-3 6 -6 8Z" fill="#d4a843" stroke="#b8922e" strokeWidth="1" />
        {/* Beak lower */}
        <path d="M-5 12 Q-3 22 0 24 Q3 22 5 12 Q2 10 0 10 Q-2 10 -5 12Z" fill="#c49a3a" />
        {/* Beak tip */}
        <path d="M-2 24 Q0 28 2 24" stroke="#b8922e" strokeWidth="1" fill="none" />

        {/* Nostrils */}
        <circle cx="-2" cy="14" r="0.8" fill="#0f1419" />
        <circle cx="2" cy="14" r="0.8" fill="#0f1419" />

        {/* Feather details - left cheek */}
        <path d="M-40 15 Q-38 25 -30 32 Q-35 25 -35 18Z" fill="#d0d0d0" />
        <path d="M-42 20 Q-40 30 -32 36 Q-36 28 -38 22Z" fill="#b8b8b8" />

        {/* Feather details - right cheek */}
        <path d="M40 15 Q38 25 30 32 Q35 25 35 18Z" fill="#d0d0d0" />
        <path d="M42 20 Q40 30 32 36 Q36 28 38 22Z" fill="#b8b8b8" />

        {/* Chin feather tuft */}
        <path d="M-8 35 Q-5 42 0 44 Q5 42 8 35 Q4 38 0 38 Q-4 38 -8 35Z" fill="#c8c8c8" />

        {/* Crown feathers - subtle */}
        <path d="M-15 -50 Q-10 -58 0 -60 Q10 -58 15 -50" stroke="#e0e0e0" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M-8 -52 Q-3 -60 0 -62 Q3 -60 8 -52" stroke="#d0d0d0" strokeWidth="1.5" fill="none" opacity="0.6" />
      </g>

      {/* Text: BHAIRAV */}
      <text
        x="200"
        y="310"
        textAnchor="middle"
        fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
        fontWeight="900"
        fontSize="52"
        letterSpacing="12"
        fill="#ffffff"
      >
        BHAIRAV
      </text>

      {/* Subtle underline accent */}
      <line x1="130" y1="322" x2="270" y2="322" stroke="#d4a843" strokeWidth="2" opacity="0.7" />

      {/* Small decorative stars flanking text */}
      <polygon points="115,318 117,314 119,318 117,322" fill="#d4a843" opacity="0.8" />
      <polygon points="285,318 287,314 289,318 287,322" fill="#d4a843" opacity="0.8" />
    </svg>
  );
}
