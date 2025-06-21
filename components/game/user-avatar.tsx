export const UserAvatar = ({ className }: { className?: string }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="#A7F3D0" /> {/* Light brand green background */}
    <rect x="30" y="60" width="40" height="30" rx="5" fill="#718096" /> {/* Shirt - gray */}
    <circle cx="50" cy="35" r="20" fill="#FCE5CD" /> {/* Head - another skin tone */}
    <circle cx="42" cy="32" r="3" fill="#2D3748" /> {/* Eye */}
    <circle cx="58" cy="32" r="3" fill="#2D3748" /> {/* Eye */}
    <path d="M45 45 Q50 48 55 45" stroke="#2D3748" strokeWidth="2" fill="none" /> {/* Slightly worried mouth */}
    <path d="M30 20 Q50 10 70 20 L65 30 Q50 25 35 30 Z" fill="#4A5568" /> {/* Hair */}
  </svg>
)
