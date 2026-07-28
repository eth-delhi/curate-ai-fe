interface LogoProps {
  className?: string;
}

// Minimal geometric cat mark for Curate AI. Single currentColor fill so it
// themes with text color; eye cutouts match the app's paper background.
export function Logo({ className = "h-7 w-7" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.2 14.5 L7.6 5.4 Q8.4 2.6 9.6 5.2 L14.2 13.3 Z"
        fill="currentColor"
      />
      <path
        d="M25.8 14.5 L24.4 5.4 Q23.6 2.6 22.4 5.2 L17.8 13.3 Z"
        fill="currentColor"
      />
      <circle cx="16" cy="19" r="11" fill="currentColor" />
      <ellipse cx="12.1" cy="18.6" rx="1.6" ry="2.1" fill="#FAFAF8" />
      <ellipse cx="19.9" cy="18.6" rx="1.6" ry="2.1" fill="#FAFAF8" />
    </svg>
  );
}

export default Logo;
