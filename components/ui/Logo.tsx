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
      <path d="M9 3L13.5 13H5.5L9 3Z" fill="currentColor" />
      <path d="M23 3L26.5 13H19.5L23 3Z" fill="currentColor" />
      <circle cx="16" cy="19" r="11" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="#FAFAF8" />
      <circle cx="20" cy="19" r="1.8" fill="#FAFAF8" />
    </svg>
  );
}

export default Logo;
