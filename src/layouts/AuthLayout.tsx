/**
 * AuthLayout — Unified split-screen authentication frame.
 *
 * A single layout shared by every auth screen (Login, Register, OTP verify,
 * Google callback). The left "aside" is a constant branded surface (teal brand
 * gradient + decorative blobs + contextual copy); the right panel renders the
 * active form via `children`.
 *
 * • Responsive: the aside is hidden below `md`; a compact brand header takes its
 *   place so branding persists on mobile, and the form fills the width.
 * • Theme-aware: surfaces/text use MUI tokens so it works in light and dark.
 * • Motion: a subtle fade-up entrance, disabled under prefers-reduced-motion.
 *
 * See design/profile-manager-redesign.html · §3 Authentication in the
 * ui-design-system skill for the reference visual.
 */

import type { ReactNode } from "react";
import { Box, Stack, Typography, alpha } from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { BrandMark } from "@/common/components";
import { APP_NAME, ROUTES } from "@/constants";

// Brand gradient — a fixed teal identity surface, consistent across themes.
// Mirrors the `--grad-brand` token from the design system.
const BRAND_GRADIENT =
  "linear-gradient(140deg, #00b3a0 0%, #00897b 52%, #00655a 100%)";

type AuthStep = "login" | "register" | "otp" | "google";

interface AsideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/** Contextual marketing copy for the branded aside, keyed by auth step. */
const ASIDE_COPY: Record<AuthStep, AsideCopy> = {
  login: {
    eyebrow: "Welcome back",
    title: "Your professional story, beautifully managed.",
    subtitle:
      "Keep your experience, skills, projects and documents in one polished, always-ready profile.",
  },
  register: {
    eyebrow: "Get started — it's free",
    title: "Build a standout profile in minutes.",
    subtitle:
      "Create your account and we'll guide you through every section, step by step.",
  },
  otp: {
    eyebrow: "Almost there",
    title: "Check your inbox to continue.",
    subtitle:
      "We sent a secure 6-digit code to confirm it's really you before we set things up.",
  },
  google: {
    eyebrow: "Signing you in",
    title: "Connecting your Google account.",
    subtitle:
      "Hang tight while we securely exchange your credentials and prepare your session.",
  },
};

/** Honest, generic value props shown at the foot of the aside. */
const HIGHLIGHTS = [
  "Track your profile completion in real time",
  "Manage experience, skills, projects & documents",
  "Secure, private, and always in sync",
];

/** Resolve the current auth step from the pathname. */
const resolveStep = (pathname: string): AuthStep => {
  if (pathname.startsWith(ROUTES.REGISTER)) return "register";
  if (pathname.startsWith(ROUTES.VERIFY_OTP_PAGE)) return "otp";
  if (pathname.startsWith(ROUTES.GOOGLE_CALLBACK)) return "google";
  return "login";
};

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const copy = ASIDE_COPY[resolveStep(pathname)];

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ── Branded aside (hidden below md) ──────────────────────────────── */}
      <Box
        aria-hidden
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          flexBasis: { md: "46%", lg: "52%" },
          position: "relative",
          overflow: "hidden",
          p: { md: 5, lg: 7 },
          color: "#ffffff",
          background: BRAND_GRADIENT,
        }}
      >
        {/* Decorative blobs */}
        <Box
          sx={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            right: -120,
            bottom: -140,
            background: alpha("#ffffff", 0.1),
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            left: -80,
            top: -70,
            background: alpha("#ffffff", 0.08),
          }}
        />

        {/* Top — brand */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <BrandMark variant="onBrand" />
        </Box>

        {/* Middle — contextual headline */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.14em",
              opacity: 0.9,
            }}
          >
            {copy.eyebrow}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              mt: 1.5,
              mb: 2,
            }}
          >
            {copy.title}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, fontSize: "1.05rem" }}>
            {copy.subtitle}
          </Typography>
        </Box>

        {/* Bottom — value props */}
        <Stack
          spacing={1.5}
          sx={{ position: "relative", zIndex: 1, maxWidth: 460 }}
        >
          {HIGHLIGHTS.map((item) => (
            <Stack key={item} direction="row" spacing={1.25} alignItems="center">
              <CheckCircleRounded sx={{ fontSize: 20, opacity: 0.95 }} />
              <Typography variant="body2" sx={{ opacity: 0.92 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Form panel ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          px: { xs: 2.5, sm: 5 },
          py: { xs: 4, sm: 5 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            // Subtle fade-up entrance (respects reduced-motion).
            "@media (prefers-reduced-motion: no-preference)": {
              animation: "authFadeUp 0.5s cubic-bezier(0.22,0.61,0.36,1) both",
            },
            "@keyframes authFadeUp": {
              from: { opacity: 0, transform: "translateY(14px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Mobile-only brand header (aside is hidden below md) */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              mb: 4,
            }}
          >
            <BrandMark variant="default" />
          </Box>

          {children}
        </Box>

        {/* Footer note */}
        <Typography
          variant="caption"
          sx={{
            mt: 4,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
