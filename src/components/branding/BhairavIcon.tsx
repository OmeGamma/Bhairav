export function BhairavIcon({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular background */}
      <circle cx="100" cy="100" r="95" fill="#0B1017" stroke="#000000" strokeWidth="8" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#c5a44e" strokeWidth="1.5" opacity="0.4" />

      {/* Eagle head group - centered */}
      <g transform="translate(100, 95)">
        {/* Neck/base shadow */}
        <ellipse cx="0" cy="30" rx="35" ry="22" fill="#0f1419" />

        {/* Feather layers - back */}
        <path d="M-32 12 Q-35 -5 -20 -22 Q-8 -32 0 -35 Q8 -32 20 -22 Q35 -5 32 12 Q28 22 20 26 Q8 28 0 28 Q-8 28 -20 26 Q-28 22 -32 12Z" fill="#1a1f2e" />
        
        {/* Main head shape */}
        <path d="M-28 10 Q-32 -8 -16 -25 Q-6 -35 0 -37 Q6 -35 16 -25 Q32 -8 28 10 Q25 20 16 25 Q6 27 0 27 Q-6 27 -16 25 Q-25 20 -28 10Z" fill="#e8e8e8" />

        {/* Forehead/beret base */}
        <path d="M-25 3 Q-28 -12 -12 -28 Q0 -38 12 -28 Q28 -12 25 3 Q22 10 12 13 Q0 14 -12 13 Q-22 10 -25 3Z" fill="#4a5d23" />

        {/* Beret detail - left side */}
        <path d="M-25 3 Q-30 -10 -14 -26 Q-5 -35 0 -36 L0 -28 Q-6 -27 -14 -18 Q-22 -8 -24 3Z" fill="#3d4f1c" />

        {/* Beret detail - right side */}
        <path d="M25 3 Q30 -10 14 -26 Q5 -35 0 -36 L0 -28 Q6 -27 14 -18 Q22 -8 24 3Z" fill="#5a6f2e" />

        {/* Gold star insignia on beret */}
        <g transform="translate(0, -14)">
          <polygon points="0,-5 1.5,-1.5 5,-1.5 2,1 3.2,5 0,2.5 -3.2,5 -2,1 -5,-1.5 -1.5,-1.5" fill="#d4a843" stroke="#b8922e" strokeWidth="0.6" />
        </g>

        {/* Brow ridge - fierce expression */}
        <path d="M-22 -3 Q-16 -8 -6 -6 Q0 -4 6 -6 Q16 -8 22 -3" stroke="#0f1419" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Left eye socket */}
        <ellipse cx="-9" cy="0" rx="6" ry="4" fill="#0f1419" />
        {/* Left eye */}
        <ellipse cx="-9" cy="0" rx="5" ry="3.5" fill="#d4a843" />
        {/* Left pupil */}
        <ellipse cx="-9" cy="0" rx="2.5" ry="2.5" fill="#0f1419" />
        {/* Left eye highlight */}
        <ellipse cx="-10.5" cy="-1.5" rx="1.2" ry="1" fill="#ffffff" opacity="0.9" />

        {/* Right eye socket */}
        <ellipse cx="9" cy="0" rx="6" ry="4" fill="#0f1419" />
        {/* Right eye */}
        <ellipse cx="9" cy="0" rx="5" ry="3.5" fill="#d4a843" />
        {/* Right pupil */}
        <ellipse cx="9" cy="0" rx="2.5" ry="2.5" fill="#0f1419" />
        {/* Right eye highlight */}
        <ellipse cx="7.5" cy="-1.5" rx="1.2" ry="1" fill="#ffffff" opacity="0.9" />

        {/* Beak upper */}
        <path d="M-4 8 Q-5 14 -2.5 20 Q0 22 2.5 20 Q5 14 4 8 Q2 7 0 7 Q-2 7 -4 8Z" fill="#d4a843" stroke="#b8922e" strokeWidth="0.8" />
        {/* Beak lower */}
        <path d="M-3 10 Q-2 16 0 17 Q2 16 3 10 Q1.5 9 0 9 Q-1.5 9 -3 10Z" fill="#c49a3a" />

        {/* Nostrils */}
        <circle cx="-1.2" cy="11" r="0.7" fill="#0f1419" />
        <circle cx="1.2" cy="11" r="0.7" fill="#0f1419" />

        {/* Feather details - left cheek */}
        <path d="M-26 10 Q-24 16 -19 21 Q-22 16 -22 12Z" fill="#d0d0d0" />
        <path d="M-27 14 Q-25 20 -20 24 Q-23 18 -24 15Z" fill="#b8b8b8" />

        {/* Feather details - right cheek */}
        <path d="M26 10 Q24 16 19 21 Q22 16 22 12Z" fill="#d0d0d0" />
        <path d="M27 14 Q25 20 20 24 Q23 18 24 15Z" fill="#b8b8b8" />

        {/* Chin feather tuft */}
        <path d="M-5 23 Q-3 28 0 29 Q3 28 5 23 Q2.5 25 0 25 Q-2.5 25 -5 23Z" fill="#c8c8c8" />

        {/* Crown feathers - subtle */}
        <path d="M-10 -32 Q-6 -38 0 -40 Q6 -38 10 -32" stroke="#e0e0e0" strokeWidth="1.5" fill="none" opacity="0.7" />
      </g>

      {/* Inner ring accent */}
      <circle cx="100" cy="100" r="60" fill="none" stroke="#1a1f2e" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
