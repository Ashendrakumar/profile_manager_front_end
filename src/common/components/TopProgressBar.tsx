/**
 * TopProgressBar
 * A thin, fixed progress bar at the top of the viewport, shown during
 * route-guard checks. Causes zero layout shift since it overlays content
 * rather than replacing it.
 */

import { styled, keyframes } from "@mui/material/styles";

// ----------------------------------------------------------------------

const indeterminate = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const indeterminateShort = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
`;

export function TopProgressBar() {
  return (
    <ProgressBarRoot>
      <ProgressBarTrack />
      <ProgressBarIndicatorLong />
      <ProgressBarIndicatorShort />
    </ProgressBarRoot>
  );
}

// ----------------------------------------------------------------------
// Styled parts

const ProgressBarRoot = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  position: "fixed",
  zIndex: theme.zIndex.tooltip + 1,
  overflow: "hidden",
}));

const ProgressBarTrack = styled("div")(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.primary.main,
  opacity: 0.15,
}));

const ProgressBarIndicatorLong = styled("div")(({ theme }) => ({
  position: "absolute",
  height: "100%",
  backgroundColor: theme.palette.primary.main,
  animation: `${indeterminate} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`,
}));

const ProgressBarIndicatorShort = styled("div")(({ theme }) => ({
  position: "absolute",
  height: "100%",
  backgroundColor: theme.palette.primary.main,
  animation: `${indeterminateShort} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite`,
  animationDelay: "1.15s",
}));
