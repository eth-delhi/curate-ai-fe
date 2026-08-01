import * as React from "react";

/**
 * Custom social/engagement icon set — replaces generic lucide-react /
 * react-icons glyphs for clap, comment, notification, bookmark, flag,
 * upvote and follow so the UI doesn't read as an off-the-shelf icon pack.
 * One shared visual language: 24x24 viewBox, thin (1.5-1.6) stroke, rounded
 * caps/joins, no fill by default (accepts `className`/`fill-current` the
 * same way lucide icons do, so existing toggle patterns keep working).
 */

export type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Filled (not outlined) — a raised, open hand. Thin parallel-line fingers
// read as a comb/claw at small sizes, so this is a solid silhouette instead
// (fingers + thumb overlap the palm so the fill merges into one shape).
export function ClapIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="7.5" y="13" width="9" height="8" rx="3.2" />
      <rect x="8.2" y="6.5" width="1.9" height="9.5" rx="0.95" />
      <rect x="10.6" y="4.2" width="1.9" height="11.8" rx="0.95" />
      <rect x="13" y="4.6" width="1.9" height="11.4" rx="0.95" />
      <rect x="15.4" y="6.8" width="1.9" height="9.2" rx="0.95" />
      <rect
        x="5"
        y="14"
        width="2"
        height="6.5"
        rx="1"
        transform="rotate(-38 6 14)"
      />
    </svg>
  );
}

export function CommentIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <path d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v7C20 14.88 18.88 16 17.5 16H10l-4.5 3.5V16h-.5C4.12 16 4 14.88 4 13.5v-7Z" />
      <circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BellIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <path d="M6 10.5C6 6.9 8.69 4 12 4s6 2.9 6 6.5c0 3.2 0.8 5 2 6.3H4c1.2-1.3 2-3.1 2-6.3Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

export function BookmarkIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4-6.5 4V5.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function FlagIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <path d="M6 20V4" />
      <path d="M6 5c1.6-1 3.2-1 5 0s3.4 1 5 0v8c-1.6 1-3.2 1-5 0s-3.4-1-5 0Z" />
    </svg>
  );
}

export function UpvoteIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  const ringWidth =
    typeof strokeWidth === "number" ? strokeWidth * 0.8 : strokeWidth;
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <circle cx="12" cy="12" r="8.2" strokeWidth={ringWidth} />
      <path d="M12 15.5V8.5" />
      <path d="M8.7 11.8 12 8.5l3.3 3.3" />
    </svg>
  );
}

export function FollowIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <circle cx="10" cy="8.5" r="3" />
      <path d="M4.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M18 8v4" />
      <path d="M16 10h4" />
    </svg>
  );
}

export function UnfollowIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <circle cx="10" cy="8.5" r="3" />
      <path d="M4.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 10h4" />
    </svg>
  );
}

export function WalletIcon({ strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg {...base} strokeWidth={strokeWidth} {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2.5" />
      <rect x="6" y="4" width="10" height="5" rx="1.5" />
      <circle cx="16.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
