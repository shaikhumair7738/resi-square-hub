import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  withText?: boolean;
  to?: string;
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* outer house outline */}
      <path
        d="M24 4 L44 20 V42 H4 V20 Z"
        stroke="oklch(0.7 0.18 45)"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      {/* roof tabs */}
      <path
        d="M9 24 V18 H15"
        stroke="oklch(0.7 0.18 45)"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M39 24 V18 H33"
        stroke="oklch(0.7 0.18 45)"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      {/* door */}
      <rect
        x="20"
        y="28"
        width="8"
        height="14"
        fill="oklch(0.7 0.18 45)"
      />
    </svg>
  );
}

export function Logo({ className = "", variant = "default", withText = true, to = "/" }: LogoProps) {
  const text =
    variant === "light"
      ? "text-white"
      : "text-brand";
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
      aria-label="Resisquare home"
    >
      <LogoMark size={32} />
      {withText && <span className={`text-lg ${text}`}>Resisquare</span>}
    </Link>
  );
}
