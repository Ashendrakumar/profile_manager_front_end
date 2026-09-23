/**
 * Material UI Theme — Profile Manager Design System v2.0
 *
 * The single source of truth for the app's look. Everything is token-driven:
 * change a value here and it cascades to every screen (per the ui-design-system
 * skill). Encodes the teal brand scale, warm coral accent, Inter/Sora type,
 * soft teal-tinted elevation, gradient primary buttons, input focus-glow, and a
 * global reduced-motion guard. Light + dark are both first-class.
 */

import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

type Mode = "light" | "dark";

// ── Brand + semantic tokens ──────────────────────────────────────────────────
const teal = {
  50: "#e6f6f4",
  100: "#c2e9e4",
  200: "#8fd6cd",
  300: "#4fbdb0",
  400: "#26a698",
  500: "#00968a",
  600: "#00897b", // primary.main
  700: "#00796b",
  800: "#00655a",
  900: "#004d40",
};

const coral = { light: "#ff7a66", main: "#ff5a3c", dark: "#e94a2e" };

export const BRAND_GRADIENT =
  "linear-gradient(135deg, #00b3a0 0%, #00897b 55%, #00655a 100%)";
const CORAL_GRADIENT =
  "linear-gradient(135deg, #ff7a66 0%, #ff5a3c 55%, #e94a2e 100%)";

// ── Type ─────────────────────────────────────────────────────────────────────
const FONT_UI = '"Inter", "Helvetica", "Arial", sans-serif';
const FONT_DISPLAY = '"Sora", "Inter", sans-serif';

// ── Motion ───────────────────────────────────────────────────────────────────
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

// ── Elevation ────────────────────────────────────────────────────────────────
export const TEAL_GLOW = "0 12px 30px rgba(0,137,123,0.28)";
const TEAL_GLOW_HOVER = "0 16px 38px rgba(0,137,123,0.40)";
const CORAL_GLOW = "0 12px 30px rgba(255,90,60,0.30)";
const FOCUS_RING = "0 0 0 4px rgba(0,150,138,0.16)";
const ERROR_RING = "0 0 0 4px rgba(244,63,110,0.15)";

// ── Per-mode surface + primary tokens ────────────────────────────────────────
const modeTokens = {
  light: {
    background: { default: "#f4f7f8", paper: "#ffffff" },
    // Hairlines carry a trace of the brand hue so they sit in the same family
    // as the ambient wash instead of reading as neutral grey on top of it.
    divider: "#e1ecea",
    dividerStrong: "#cfdedb",
    text: { primary: "#0f1e1c", secondary: "#5c6d6a", disabled: "#9aa8a5" },
    primary: {
      light: teal[400],
      main: teal[600],
      dark: teal[800],
      contrastText: "#ffffff",
      50: teal[50],
      100: teal[100],
      200: teal[200],
      300: teal[300],
      400: teal[400],
      500: teal[500],
      600: teal[600],
      700: teal[700],
      800: teal[800],
      900: teal[900],
    },
    // Three layers instead of two: a hairline contact shadow, a mid diffusion,
    // and a wide teal-tinted ambient cast. The tint is what stops light mode
    // reading as grey cards on a grey page.
    cardShadow:
      "0 1px 2px rgba(6,40,36,0.04), 0 4px 12px rgba(6,40,36,0.055), 0 12px 28px rgba(0,137,123,0.05)",
    cardShadowHover:
      "0 2px 4px rgba(6,40,36,0.05), 0 8px 20px rgba(6,40,36,0.09), 0 22px 46px rgba(0,137,123,0.11)",
    paperShadow:
      "0 1px 2px rgba(6,40,36,0.04), 0 4px 12px rgba(6,40,36,0.055), 0 12px 28px rgba(0,137,123,0.05)",
    inputHoverBorder: teal[300],
    focusBorder: teal[600],
  },
  dark: {
    background: { default: "#0b1413", paper: "#111d1b" },
    divider: "#22322f",
    dividerStrong: "#2c3d3a",
    text: { primary: "#eaf4f2", secondary: "#9fb2ae", disabled: "#5f716e" },
    // Scale is inverted for dark so low indices read dark (surfaces / active bg)
    // and high indices read light (active text) — keeps sidebar/active states legible.
    primary: {
      light: teal[300],
      main: teal[400],
      dark: teal[600],
      contrastText: "#ffffff",
      50: teal[900],
      100: teal[200],
      200: teal[700],
      300: teal[600],
      400: teal[400],
      500: teal[500],
      600: teal[200],
      700: teal[100],
      800: teal[50],
      900: teal[50],
    },
    cardShadow: "0 2px 12px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.30)",
    cardShadowHover: "0 10px 28px rgba(0,0,0,0.55)",
    paperShadow: "0 2px 12px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.30)",
    inputHoverBorder: teal[400],
    focusBorder: teal[400],
  },
} as const;

// ── Shared typography ────────────────────────────────────────────────────────
const heading = (fontSize: string, fontWeight: number, lineHeight = 1.2) => ({
  fontFamily: FONT_DISPLAY,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing: "-0.02em",
});

const typography: ThemeOptions["typography"] = {
  fontFamily: FONT_UI,
  fontSize: 14,
  h1: heading("2.5rem", 800, 1.1),
  h2: heading("2rem", 800, 1.15),
  h3: heading("1.75rem", 700, 1.2),
  h4: heading("1.5rem", 700, 1.25),
  h5: heading("1.25rem", 600, 1.35),
  h6: heading("1.125rem", 600, 1.4),
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 600 },
  body1: { fontSize: "1rem", lineHeight: 1.55 },
  body2: { fontSize: "0.875rem", lineHeight: 1.55 },
  button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
  overline: {
    fontWeight: 700,
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
};

// ── Component overrides (per mode) ───────────────────────────────────────────
const buildComponents = (mode: Mode): ThemeOptions["components"] => {
  const t = modeTokens[mode];

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          // Light mode gets an ambient brand wash behind everything, so the
          // pure-white cards lift off the page instead of blending into a flat
          // near-white slab. Fixed attachment keeps it reading as a backdrop
          // rather than as content that scrolls. Dark mode keeps its flat
          // surface — the depth there already comes from the surfaces.
          ...(mode === "light" && {
            backgroundImage: [
              "radial-gradient(900px 520px at 8% -10%, rgba(0,178,160,0.13), transparent 62%)",
              "radial-gradient(760px 460px at 98% 2%, rgba(0,137,123,0.085), transparent 58%)",
              "radial-gradient(700px 540px at 45% 115%, rgba(0,101,90,0.06), transparent 60%)",
            ].join(", "),
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
          }),
        },
        // Global accessibility guard for users who prefer reduced motion.
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { size: "large" },
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: "none",
          paddingInline: "22px",
          transition: `background 0.28s ${EASE}, box-shadow 0.28s ${EASE}, transform 0.28s ${EASE}, border-color 0.28s ${EASE}`,
        },
        containedPrimary: {
          background: BRAND_GRADIENT,
          color: "#ffffff",
          boxShadow: TEAL_GLOW,
          "&:hover": { boxShadow: TEAL_GLOW_HOVER, transform: "translateY(-2px)" },
          "&:active": { transform: "translateY(0)" },
          "&.Mui-disabled": {
            background: "rgba(0,137,123,0.35)",
            color: "rgba(255,255,255,0.85)",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          background: CORAL_GRADIENT,
          color: "#ffffff",
          boxShadow: CORAL_GLOW,
          "&:hover": { transform: "translateY(-2px)" },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          borderWidth: 1.5,
          "&:hover": { borderWidth: 1.5, transform: "translateY(-2px)" },
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${t.divider}`,
          boxShadow: t.cardShadow,
          backgroundImage: "none",
          transition: `box-shadow 0.28s ${EASE}, transform 0.28s ${EASE}, border-color 0.28s ${EASE}`,
          // Cards are static by default — no hover lift. Only cards that are
          // genuinely interactive (clickable list/entity cards) opt in with
          // `data-interactive="true"` to get the pointer + hover lift.
          '&[data-interactive="true"]': { cursor: "pointer" },
          '&[data-interactive="true"]:hover': {
            boxShadow: t.cardShadowHover,
            transform: "translateY(-4px)",
            borderColor: t.primary.main,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", borderRadius: 16 },
        elevation1: { boxShadow: t.paperShadow },
      },
    },

    MuiAppBar: {
      styleOverrides: { root: { borderRadius: 0, backgroundImage: "none" } },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: `box-shadow 0.2s ${EASE}`,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: t.divider,
            borderWidth: 1.5,
            transition: `border-color 0.2s ${EASE}`,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: t.inputHoverBorder,
          },
          "&.Mui-focused": { boxShadow: FOCUS_RING },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: t.focusBorder,
            borderWidth: 1.5,
          },
          "&.Mui-error.Mui-focused": { boxShadow: ERROR_RING },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: "0.8rem",
          fontWeight: 600,
          height: 28,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: "0.9rem",
          fontWeight: 600,
          minHeight: 48,
          textTransform: "none",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: "0.9rem", padding: "12px 16px" },
        head: {
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.text.secondary,
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
          "@media (min-width: 600px)": {
            paddingLeft: "32px",
            paddingRight: "32px",
          },
          "@media (min-width: 1200px)": { maxWidth: "1400px" },
        },
      },
    },
  };
};

// ── Theme assembly ───────────────────────────────────────────────────────────
const buildTheme = (mode: Mode) => {
  const t = modeTokens[mode];

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: t.primary,
      secondary: {
        light: coral.light,
        main: coral.main,
        dark: coral.dark,
        contrastText: "#ffffff",
      },
      background: t.background,
      divider: t.divider,
      text: t.text,
      error: { main: "#f43f6e" },
      warning: { main: "#f5a524" },
      info: { main: "#2e9bff" },
      success: { main: "#18b368" },
    },
    typography,
    shape: { borderRadius: 12 },
    components: buildComponents(mode),
  };

  return createTheme(options);
};

// Create themes
export const lightTheme = buildTheme("light");
export const darkTheme = buildTheme("dark");

// Export default theme (light)
export const theme = lightTheme;

// Theme type for TypeScript
export type ThemeMode = "light" | "dark";
