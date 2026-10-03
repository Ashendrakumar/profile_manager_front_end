/**
 * Logo — the Profile Manager mark.
 *
 * The app's signature completion ring (swept ~78% and left open) wrapped around
 * a profile glyph: "a profile in progress". Kept in sync with `public/logo.svg`
 * and `public/favicon.svg` — change one, change all three.
 *
 * `tone="brand"` paints it in the teal brand gradient for neutral surfaces;
 * `tone="mono"` paints it in `currentColor` so it can sit on the brand gradient
 * itself (auth aside) or inherit any text colour.
 */

import { useId } from "react";

export type LogoProps = {
  /** Rendered size in px (square). */
  size?: number;
  /** Colour treatment: brand gradient, or inherit `currentColor`. */
  tone?: "brand" | "mono";
  /** Accessible name. Omit for decorative use alongside the wordmark. */
  title?: string;
};

export const Logo = ({ size = 40, tone = "brand", title }: LogoProps) => {
  // Gradient ids must be unique — several logos can share a page.
  const gradientId = useId();
  const titleId = `${gradientId}-title`;
  const paint = tone === "mono" ? "currentColor" : `url(#${gradientId})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      {title && <title id={titleId}>{title}</title>}

      {tone === "brand" && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="6"
            y1="4"
            x2="58"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#00b3a0" />
            <stop offset="0.55" stopColor="#00897b" />
            <stop offset="1" stopColor="#00655a" />
          </linearGradient>
        </defs>
      )}

      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={paint}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray="122.5 34.6"
        transform="rotate(-90 32 32)"
      />

      <circle cx="32" cy="24" r="7" fill={paint} />
      <path d="M19 47v-0.5c0-7.18 5.82-13 13-13s13 5.82 13 13V47Z" fill={paint} />
    </svg>
  );
};
