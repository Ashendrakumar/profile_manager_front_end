/**
 * OTP Verification Page
 * Reads a signed OTP token from the URL param (/verify-otp/:token),
 * decodes it to get email + fullName, checks expiry, and lets the user verify.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useAuth } from "@/contexts";
import { theme } from "@/theme";
import { ROUTES } from "@/constants";

const OTP_LENGTH = 6;
const COUNTDOWN_INTERVAL = 10 * 60;

interface OtpTokenPayload {
  email: string;
  fullName: string;
  exp: number;
  iat?: number;
}

const OtpVerificationPage = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decode token using jwt-decode
  let decoded: OtpTokenPayload | null = null;
  try {
    if (token) decoded = jwtDecode<OtpTokenPayload>(token);
  } catch {
    decoded = null;
  }

  const email = decoded?.email ?? "";
  const fullName = decoded?.fullName ?? "";

  // Seed the countdown from the backend token's exp — how many seconds remain
  const initialCountdown = decoded?.exp
    ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
    : 0;

  const [countdown, setCountdown] = useState(initialCountdown);
  const [canResend, setCanResend] = useState(initialCountdown <= 0);

  /**
   * Guard: redirect to register if token is missing, malformed, or expired.
   */
  useEffect(() => {
    if (!token || !decoded) {
      navigate(ROUTES.REGISTER, { replace: true });
      return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp < nowInSeconds) {
      // Token has expired — send back to register so they can resend OTP
      navigate(ROUTES.REGISTER, {
        replace: true,
        state: {
          otpExpired: true,
          message:
            "Your verification link has expired. Please register again to receive a new code.",
        },
      });
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1); // only last digit
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (error) clearError();

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp].join("");
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();

        if (otp[index]) {
          // Clear current input
          const newOtp = [...otp];
          newOtp[index] = "";
          setOtp(newOtp);
        } else if (index > 0) {
          // Move to previous input and clear it
          inputRefs.current[index - 1]?.focus();

          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
        }
        break;

      case "ArrowLeft":
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
        break;

      case "ArrowRight":
        if (index < OTP_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }
        break;

      default:
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  };

  const handleVerify = useCallback(
    async (otpValue?: string) => {
      const code = otpValue ?? otp.join("");
      if (code.length < OTP_LENGTH) {
        return;
      }
      setIsSubmitting(true);
      try {
        await verifyOtp(email, code);
      } catch {
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, email, verifyOtp],
  );

  const handleResend = async () => {
    setIsResending(true);
    if (error) clearError();
    try {
      await resendOtp(email);
      setCountdown(COUNTDOWN_INTERVAL); // fresh OTP = new 10-min window
      setCanResend(false);
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      // error is set in context
    } finally {
      setIsResending(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;
  const isComplete = filledCount === OTP_LENGTH;

  return (
    <>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        {fullName ? (
          <>
            Hi,{" "}
            <Typography
              component="span"
              variant="h4"
              color="primary.main"
              sx={{ textTransform: "capitalize" }}
            >
              {fullName}
            </Typography>
            !
          </>
        ) : (
          <>
            Verify your
            <Typography component="span" variant="h4" color="primary.main">
              {" "}
              email with OTP
            </Typography>
          </>
        )}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 3 }}
      >
        We sent a 6-digit verification code to{" "}
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
          {email}
        </Box>
        . Enter it below to verify your account.
      </Typography>

      {/* OTP inputs */}
      <Box
        onPaste={handlePaste}
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          justifyContent: "center",
          mb: 4,
        }}
      >
        {otp.map((digit, index) => (
          <TextField
            id={`otp-input-${index}`}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)
            }
            onFocus={(e) => e.target.select()}
            disabled={isSubmitting || isLoading || isResending || canResend}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
            inputMode="numeric"
            type="tel"
            inputProps={{
              maxLength: 1,
              pattern: "[0-9]*",
              style: { textAlign: "center", fontSize: 22, fontWeight: 700 },
            }}
            sx={{ width: 56 }}
            key={index + "__id"}
          />
        ))}
      </Box>

      {/* Progress indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 0.6,
          mb: 1,
        }}
      >
        {otp.map((d, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: d
                ? theme.palette.primary.main
                : theme.palette.grey[400],
              transition: "background 0.2s",
            }}
          />
        ))}
      </Box>

      {/* Verify / Resend */}
      {!canResend ? (
        <Box sx={{ textAlign: "center" }}>
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!isComplete || isSubmitting || isLoading}
            onClick={() => handleVerify()}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Typography variant="body2" sx={{ color: "primary.main" }}>
            Resend code in{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(countdown)}
            </Box>
          </Typography>
        </Box>
      ) : (
        <Box textAlign="center">
          Didn't receive the code?
          <Typography
            component="span"
            sx={{ color: "primary.main", cursor: "pointer" }}
            variant="button"
            onClick={isResending ? undefined : handleResend}
          >
            {isResending ? <CircularProgress size={14} /> : " Resend"}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default OtpVerificationPage;
