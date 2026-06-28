import { Close } from "@mui/icons-material";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import { useMemo } from "react";

type SideDrawerProps = {
  open: boolean;
  onClose?: (value: boolean) => void;
  loading?: boolean;
  title: string;
  subTitle?: string;
  footerActionClick?: () => void;
  footerActionName?: string;
  children: React.ReactNode;
};
export const SideDrawer = ({
  open,
  onClose,
  loading = false,
  title,
  subTitle,
  footerActionClick,
  footerActionName,
  children,
}: SideDrawerProps) => {
  const isHeader = useMemo(() => {
    return title || subTitle;
  }, [title, subTitle]);

  return (
    <Drawer
      aria-labelledby="form-dialog-title"
      anchor="right"
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 0,
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          zIndex: (theme) => theme.zIndex.appBar + 2,
        },
      }}
    >
      {isHeader && (
        <DrawerHeader onClose={onClose} title={title} subTitle={subTitle} />
      )}
      <DrawerBody>{children}</DrawerBody>
      <DrawerFooter
        footerActionClick={footerActionClick}
        footerActionName={footerActionName}
        onClose={onClose}
        loading={loading}
      />
    </Drawer>
  );
};

const DrawerHeader = ({
  onClose,
  title,
  subTitle,
}: Pick<SideDrawerProps, "onClose" | "title" | "subTitle">) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 4,
        height: 54,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subTitle}
        </Typography>
      </Box>
      <IconButton
        onClick={() => onClose && onClose(false)}
        size="small"
        color="inherit"
      >
        <Close fontSize="small" />
      </IconButton>
    </Box>
  );
};

const DrawerBody = ({ children }: Pick<SideDrawerProps, "children">) => {
  return (
    <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>{children}</Box>
  );
};

const DrawerFooter = ({
  footerActionClick,
  footerActionName,
  onClose,
  loading,
}: Pick<
  SideDrawerProps,
  "footerActionClick" | "footerActionName" | "onClose" | "loading"
>) => {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        gap: 1,
      }}
    >
      {footerActionClick && (
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={footerActionClick}
          disabled={loading}
          size="medium"
        >
          {footerActionName || "Save"}
        </Button>
      )}
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        disabled={loading}
        onClick={() => onClose && onClose(false)}
        size="medium"
      >
        Close
      </Button>
    </Box>
  );
};
