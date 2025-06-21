export const BossAvatar = ({ className }: { className?: string }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="#E0E0E0" /> {/* Neutral background */}
    <rect x="30" y="60" width="40" height="30" rx="5" fill="#5A67D8" /> {/* Suit jacket - indigo */}
    <rect x="42" y="60" width="16" height="15" fill="#FFFFFF" /> {/* Shirt */}
    <path d="M46 75 L50 80 L54 75 Z" fill="#D32F2F" /> {/* Tie - red */}
    <circle cx="50" cy="35" r="20" fill="#F7CAC9" /> {/* Head - light skin tone */}
    <circle cx="42" cy="32" r="3" fill="#2D3748" /> {/* Eye */}
    <circle cx="58" cy="32" r="3" fill="#2D3748" /> {/* Eye */}
    <path d="M45 42 Q50 40 55 42" stroke="#2D3748" strokeWidth="2" fill="none" /> {/* Mouth */}
    <path d="M35 25 Q50 15 65 25" stroke="#4A5568" strokeWidth="3" fill="none" /> {/* Hair */}
    {/* Simple glasses */}
    <circle cx="41" cy="32" r="8" stroke="#4A5568" strokeWidth="1.5" fill="none" />
    <circle cx="59" cy="32" r="8" stroke="#4A5568" strokeWidth="1.5" fill="none" />
    <line x1="49" y1="32" x2="51" y2="32" stroke="#4A5568" strokeWidth="1.5" />
  </svg>
)
