/**
 * OTP Verification Page
 * Beautiful 6-digit OTP input with countdown timer and resend functionality
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
const COUNTDOWN_SECONDS = 60 * 10;

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuth();

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  //  Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate(ROUTES.REGISTER, { replace: true });
    }
  }, [email, navigate]);

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
      setCountdown(COUNTDOWN_SECONDS);
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
        Verify your
        <Typography component="span" variant="h4" color="primary.main">
          {" "}
          email with OTP
        </Typography>
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 3 }}
      >
        Check your email and enter the verification code ...
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

      {/* Verify button */}

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
