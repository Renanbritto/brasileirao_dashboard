import React from "react";

interface SoccerBallLogoProps {
  className?: string;
}

export function SoccerBallLogo({ className = "h-5 w-5" }: SoccerBallLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer sphere */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      {/* Central pentagon panel */}
      <polygon
        points="12,7.8 16,10.7 14.47,15.4 9.53,15.4 8,10.7"
        fill="currentColor"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* 5 symmetric radial seams */}
      <path
        d="M12 7.8V4.3M16 10.7L19.32 9.62M14.47 15.4L16.53 18.23M9.53 15.4L7.47 18.23M8 10.7L4.68 9.62"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 5 outer perimeter panel seams */}
      <path
        d="M9.22 2.92L12 4.3L14.78 2.92M19.78 6.55L19.32 9.62L21.5 11.83M19.59 17.72L16.53 18.23L15.09 20.98M8.91 20.98L7.47 18.23L4.41 17.72M2.5 12.17L4.68 9.62L4.22 6.55"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

