"use client"

export default function Logo1337() {
  return (
    <div className="relative group cursor-pointer">
      {/* Logo container with increased size */}
      <div className="relative w-16 h-16 transition-all duration-500 group-hover:scale-110">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        >
          {/* Outer Hexagon Ring */}
          <path
            d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5Z"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-80 group-hover:opacity-100 transition-all duration-500"
          />

          {/* Inner Broken Hexagon - Animated */}
          <path
            d="M50 15 L85 35 V75 L50 95 L15 75 V35 L50 15Z"
            stroke="url(#gradient-inner)"
            strokeWidth="2"
            strokeDasharray="40 10"
            className="opacity-60 group-hover:opacity-100 transition-all duration-700 animate-spin-slow origin-center"
          />

          {/* 1337 Text - Stylized */}
          <g className="transform translate-x-1 translate-y-1">
            {/* 1 */}
            <path d="M32 65 V35 L25 42" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* 3 */}
            <path
              d="M42 35 H52 L47 42 L52 50 H42 M47 50 L52 58 H42"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 3 */}
            <path
              d="M60 35 H70 L65 42 L70 50 H60 M65 50 L70 58 H60"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 7 */}
            <path d="M78 35 H88 L80 65" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Definitions for gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" /> {/* Violet */}
              <stop offset="50%" stopColor="#d946ef" /> {/* Fuchsia */}
              <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo */}
            </linearGradient>
            <linearGradient id="gradient-inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glitch effect overlay on hover */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
