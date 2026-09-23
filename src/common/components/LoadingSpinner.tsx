/**
 * LoadingSpinner (PageLoader)
 *
 * The app's full-screen loading experience, built to the Profile Manager
 * design language: a soft green-tinted backdrop with drifting brand blobs, the
 * signature conic-gradient ring sweeping around a glass brand disc, a shimmering
 * wordmark and a slim indeterminate progress bar.
 *
 * Token-driven (green brand + coral accent), first-class in light and dark, and
 * fully gated behind `prefers-reduced-motion`. Pure CSS animations — no
 * framer-motion dependency.
 */

import { Fragment } from "react";
import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import { styled, keyframes, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { TEAL_GLOW } from "@/theme";
import { Logo } from "./Logo";

import { APP_NAME } from "@/constants";

// ----------------------------------------------------------------------

type LoadingSpinnerProps = {
  /** Cover the whole viewport in a portal (default) vs. fill the parent box. */
  fullScreen?: boolean;
  /** Caption under the wordmark. */
  label?: string;
  /** Optional image to show inside the brand disc; falls back to the logo mark. */
  logoSrc?: string;
};

export function LoadingSpinner({
  fullScreen = true,
  label = "Loading",
  logoSrc,
}: LoadingSpinnerProps) {
  const PortalWrapper = fullScreen ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoaderScreen data-fullscreen={fullScreen || undefined}>
        <Blob data-blob="1" />
        <Blob data-blob="2" />
        <Blob data-blob="3" />

        <LoaderCenter>
          <BrandSpinner logoSrc={logoSrc} />

          <Wordmark variant="h5">{APP_NAME}</Wordmark>

          {label && (
            <Caption variant="subtitle2">
              {label}
              <Dots>
                <span />
                <span />
                <span />
              </Dots>
            </Caption>
          )}

          <ProgressTrack aria-hidden>
            <ProgressBar />
          </ProgressTrack>
        </LoaderCenter>
      </LoaderScreen>
    </PortalWrapper>
  );
}

// ----------------------------------------------------------------------
// Brand disc wrapped by a sweeping conic ring + a counter-rotating accent ring.

function BrandSpinner({ logoSrc }: { logoSrc?: string }) {
  return (
    <SpinnerRoot>
      <Halo />
      <RingSweep />
      <RingAccent />
      <RingTrack />

      <Disc>
        {logoSrc ? (
          <DiscImg src={logoSrc} alt="" />
        ) : (
          <Logo size={RING * 0.42} />
        )}
      </Disc>
    </SpinnerRoot>
  );
}

function Dots({ children }: { children: ReactNode }) {
  return <DotsRoot aria-hidden>{children}</DotsRoot>;
}

// ----------------------------------------------------------------------
// Helpers

/** Brand gradient assembled from theme tokens so it adapts to light/dark. */
const brandGradient = (p: {
  light: string;
  main: string;
  dark: string;
}) => `linear-gradient(135deg, ${p.light} 0%, ${p.main} 55%, ${p.dark} 100%)`;

// ----------------------------------------------------------------------
// Keyframes

const screenIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const spinReverse = keyframes`
  to { transform: rotate(-360deg); }
`;

const discPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(0.94); }
`;

const haloPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(0.9); }
  50%      { opacity: 0.9;  transform: scale(1.08); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-5px); opacity: 1; }
`;

const indeterminate = keyframes`
  0%   { left: -40%; width: 40%; }
  50%  { left: 25%;  width: 55%; }
  100% { left: 100%; width: 40%; }
`;

const blobDrift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -24px) scale(1.08); }
  66%      { transform: translate(-24px, 20px) scale(0.95); }
`;

// ----------------------------------------------------------------------
// Screen + backdrop

const LoaderScreen = styled("div")(({ theme }) => ({
  inset: 0,
  zIndex: theme.zIndex.modal + 10,
  width: "100%",
  height: "100%",
  display: "flex",
  position: "absolute",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
  isolation: "isolate",
  background:
    theme.palette.mode === "dark"
      ? `radial-gradient(120% 120% at 50% 0%, ${alpha(
          theme.palette.primary.dark,
          0.28,
        )} 0%, ${theme.palette.background.default} 60%)`
      : `radial-gradient(120% 120% at 50% 0%, ${alpha(
          theme.palette.primary.light,
          0.22,
        )} 0%, ${theme.palette.background.default} 60%)`,
  animation: `${screenIn} 0.4s ${theme.transitions.easing.easeOut} both`,
  '&[data-fullscreen="true"]': { position: "fixed" },
}));

const Blob = styled("span")(({ theme }) => {
  const p = theme.palette;
  return {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
    opacity: p.mode === "dark" ? 0.5 : 0.55,
    animation: `${blobDrift} 14s ${theme.transitions.easing.easeInOut} infinite`,
    '&[data-blob="1"]': {
      width: 340,
      height: 340,
      top: "-6%",
      left: "-4%",
      background: `radial-gradient(circle, ${alpha(p.primary.main, 0.55)} 0%, transparent 70%)`,
    },
    '&[data-blob="2"]': {
      width: 300,
      height: 300,
      right: "-6%",
      bottom: "-8%",
      animationDelay: "-5s",
      background: `radial-gradient(circle, ${alpha(p.secondary.main, 0.4)} 0%, transparent 70%)`,
    },
    '&[data-blob="3"]': {
      width: 240,
      height: 240,
      bottom: "10%",
      left: "12%",
      animationDelay: "-9s",
      background: `radial-gradient(circle, ${alpha(p.primary.light, 0.45)} 0%, transparent 70%)`,
    },
  };
});

const LoaderCenter = styled("div")({
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

// ----------------------------------------------------------------------
// Spinner

const RING = 132; // echoes the Profile Completion signature ring
const THICKNESS = 6;

const SpinnerRoot = styled("div")({
  width: RING,
  height: RING,
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const Halo = styled("span")(({ theme }) => ({
  position: "absolute",
  inset: -14,
  borderRadius: "50%",
  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.45)} 0%, transparent 68%)`,
  filter: "blur(6px)",
  animation: `${haloPulse} 2.4s ${theme.transitions.easing.easeInOut} infinite`,
}));

// Full static track the sweep rides on, so the circle always reads as a ring.
const RingTrack = styled("span")(({ theme }) => ({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: `${THICKNESS}px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.14)}`,
}));

// The moving arc: a conic brand gradient masked down to a ring band.
const ringMask = `radial-gradient(farthest-side, transparent calc(100% - ${THICKNESS}px), #000 calc(100% - ${THICKNESS}px))`;

const RingSweep = styled("span")(({ theme }) => ({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: `conic-gradient(from 90deg, transparent 0deg, ${alpha(
    theme.palette.primary.main,
    0.15,
  )} 90deg, ${theme.palette.primary.main} 300deg, ${theme.palette.primary.light} 360deg)`,
  WebkitMask: ringMask,
  mask: ringMask,
  animation: `${spin} 1.1s linear infinite`,
}));

// A thinner accent ring going the other way for depth.
const accentMask = `radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))`;

const RingAccent = styled("span")(({ theme }) => ({
  position: "absolute",
  inset: THICKNESS + 4,
  borderRadius: "50%",
  background: `conic-gradient(from 0deg, transparent 0deg, ${alpha(
    theme.palette.secondary.main,
    0.9,
  )} 140deg, transparent 220deg)`,
  WebkitMask: accentMask,
  mask: accentMask,
  animation: `${spinReverse} 1.8s linear infinite`,
}));

const Disc = styled("div")(({ theme }) => ({
  position: "absolute",
  width: RING - 44,
  height: RING - 44,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 24px rgba(0,0,0,0.5)"
      : TEAL_GLOW,
  animation: `${discPulse} 1.8s ${theme.transitions.easing.easeInOut} infinite`,
}));

const DiscImg = styled("img")({
  width: "76%",
  height: "76%",
  objectFit: "contain",
  display: "block",
});

// ----------------------------------------------------------------------
// Wordmark + caption

const Wordmark = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3.5),
  fontFamily: '"Sora", "Inter", sans-serif',
  fontWeight: 800,
  letterSpacing: "-0.02em",
  background: brandGradient(theme.palette.primary),
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
}));

const Caption = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.75),
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
}));

const DotsRoot = styled("span")({
  display: "inline-flex",
  alignItems: "flex-end",
  gap: 4,
  height: "1em",
  "& span": {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: `${dotBounce} 1.4s ease-in-out infinite`,
  },
  "& span:nth-of-type(2)": { animationDelay: "0.16s" },
  "& span:nth-of-type(3)": { animationDelay: "0.32s" },
});

// ----------------------------------------------------------------------
// Indeterminate progress bar

const ProgressTrack = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  width: 180,
  height: 4,
  marginTop: theme.spacing(3),
  borderRadius: 999,
  backgroundColor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.16 : 0.12,
  ),
}));

const ProgressBar = styled("span")(({ theme }) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  borderRadius: 999,
  background: brandGradient(theme.palette.primary),
  animation: `${indeterminate} 1.4s ${theme.transitions.easing.easeInOut} infinite`,
}));
