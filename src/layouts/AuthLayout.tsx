import { Box, Grid, useTheme } from "@mui/material";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const authImage =
    theme.palette.mode === "light"
      ? "/images/auth-light.png"
      : "/images/auth-dark.png";
  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Side - Image */}
      <Grid
        item
        sm={6}
        sx={{
          backgroundImage: `url(${authImage})`,
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "contain",
          backgroundPosition: "center",
          height: "100vh",
        }}
      />

      {/* Right Side - Form */}
      <Grid
        item
        xs={12}
        sm={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <Box
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 450,
          }}
        >
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
