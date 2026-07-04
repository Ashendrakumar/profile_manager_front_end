/**
 * LoadingSpinner (PageLoader)
 * Full-screen loading component: centered icon with two rings
 * spinning in opposite directions, over a subtle space/star backdrop.
 * Pure CSS animations — no framer-motion dependency.
 */

import { Fragment } from "react";

import Portal from "@mui/material/Portal";
import { styled, keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  label?: string;
  logoSrc?: string;
};

export function LoadingSpinner({
  fullScreen = true,
  label = "Loading",
  logoSrc = "/favicon.png",
}: LoadingSpinnerProps) {
  const PortalWrapper = fullScreen ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoaderScreen>
        <StarField />

        <LoaderCenter>
          <SpinnerLogo src={logoSrc} />

          {label && (
            <Typography
              variant="subtitle2"
              sx={{
                mt: 3,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {label}
              <Dots />
            </Typography>
          )}
        </LoaderCenter>
      </LoaderScreen>
    </PortalWrapper>
  );
}

// ----------------------------------------------------------------------
// Icon centered + two rings spinning in opposite directions

function SpinnerLogo({ src }: { src: string }) {
  return (
    <SpinnerRoot>
      <RingOuterWrap>
        <RingOuter />
      </RingOuterWrap>

      <RingInnerWrap>
        <RingInner />
      </RingInnerWrap>

      <IconWrap>
        <IconImg src={src} alt="Logo" />
      </IconWrap>
    </SpinnerRoot>
  );
}

function Dots() {
  return <DotsSpan>...</DotsSpan>;
}

// ----------------------------------------------------------------------
// Keyframes

const spinClockwise = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const spinCounterClockwise = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.92); }
`;

const fadeInOut = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.4); }
`;

// ----------------------------------------------------------------------
// Background star field

const STAR_COUNT = 40;

function StarField() {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    const delay = Math.random() * 3;
    const duration = Math.random() * 2 + 2;

    return (
      <Star
        key={i}
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return <StarFieldRoot>{stars}</StarFieldRoot>;
}

// ----------------------------------------------------------------------
// Styled parts — layout

const LoaderScreen = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 9998,
  width: "100%",
  height: "100%",
  display: "flex",
  position: "fixed",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? `radial-gradient(circle at 50% 40%, ${theme.palette.primary.dark}22, ${theme.palette.background.default} 70%)`
      : `radial-gradient(circle at 50% 40%, ${theme.palette.primary.light}33, ${theme.palette.background.default} 70%)`,
}));

const LoaderCenter = styled("div")({
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

// ----------------------------------------------------------------------
// Styled parts — spinner

const SpinnerRoot = styled("div")({
  width: 120,
  height: 120,
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const RingOuterWrap = styled("span")({
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "block",
  animation: `${spinClockwise} 2.6s linear infinite`,
});

const RingInnerWrap = styled("span")({
  position: "absolute",
  width: "calc(100% - 22px)",
  height: "calc(100% - 22px)",
  display: "block",
  animation: `${spinCounterClockwise} 1.8s linear infinite`,
});

const RingOuter = styled("span")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "block",
  borderRadius: "50%",
  border: "solid 3px transparent",
  borderTopColor: theme.palette.primary.main,
  borderBottomColor: theme.palette.primary.main,
}));

const RingInner = styled("span")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "block",
  borderRadius: "50%",
  border: "solid 3px transparent",
  borderLeftColor: theme.palette.primary.light,
  borderRightColor: theme.palette.primary.light,
}));

// Icon container: fixed circle, clips the image so no square/black
// corners can ever show, regardless of the source image's own bg.
const IconWrap = styled("div")(({ theme }) => ({
  position: "absolute",
  width: 64,
  height: 64,
  borderRadius: "50%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  animation: `${pulse} 1.6s ease-in-out infinite`,
}));

const IconImg = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

// ----------------------------------------------------------------------
// Styled parts — label dots

const DotsSpan = styled("span")({
  display: "inline-block",
  width: 18,
  textAlign: "left",
  animation: `${fadeInOut} 1.4s ease-in-out infinite`,
});

// ----------------------------------------------------------------------
// Styled parts — star field

const StarFieldRoot = styled("div")({
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
});

const Star = styled("span")(({ theme }) => ({
  position: "absolute",
  borderRadius: "50%",
  backgroundColor:
    theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.main,
  animation: `${twinkle} 3s ease-in-out infinite`,
}));
