/**
 * SettingsPage
 *
 * Preferences, notifications and portfolio privacy, plus account security.
 * Every toggle/select saves immediately (optimistic update, rolled back if the
 * request fails). Privacy settings control what the public portfolio shows.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  NotificationsActive,
  Palette,
  RestartAlt,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import { useThemeMode } from "@/contexts/themeContext";
import {
  ConfirmDialog,
  PageHeader,
  ResponsiveButton,
  Select,
  SkeletonLoader,
  type SelectOption,
} from "@/common/components";
import {
  settingsService,
  type SettingsSection,
  type ThemePreference,
  type UserSettings,
} from "../services/settingsService";
import { ChangePasswordCard } from "../components/ChangePasswordCard";
import { DeleteAccountCard } from "../components/DeleteAccountCard";

const THEME_OPTIONS: SelectOption[] = [
  { label: "System default", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
];

const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
];

const VISIBILITY_OPTIONS: SelectOption[] = [
  { label: "Public — anyone with the link", value: "public" },
  { label: "Private — hidden from everyone", value: "private" },
];

const NOTIFICATION_ROWS: {
  key: keyof UserSettings["notifications"];
  label: string;
  description: string;
}[] = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Receive account emails from Profile Manager",
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "Password changes and new sign-ins",
  },
  {
    key: "profileReminders",
    label: "Profile reminders",
    description: "Nudges to complete missing profile sections",
  },
  {
    key: "certificationExpiry",
    label: "Certification expiry",
    description: "A heads-up before a certification expires",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "News about new features",
  },
];

const PRIVACY_ROWS: {
  key: Exclude<keyof UserSettings["privacy"], "portfolioVisibility">;
  label: string;
}[] = [
  { key: "showEmail", label: "Show email address" },
  { key: "showPhone", label: "Show phone numbers" },
  { key: "showAddress", label: "Show address" },
  { key: "showResumeDownload", label: "Allow resume download" },
  { key: "showCertifications", label: "Show certifications" },
];

const getTimezoneOptions = (): SelectOption[] => {
  const zones: string[] =
    (
      Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf?.("timeZone") ?? [];
  const unique = Array.from(new Set(["UTC", ...zones]));
  return unique.map((zone) => ({ label: zone, value: zone }));
};

const resolveThemeMode = (theme: ThemePreference) => {
  if (theme !== "system") return theme;
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const SettingsCard = ({
  icon,
  title,
  subheader,
  children,
}: {
  icon: ReactNode;
  title: string;
  subheader?: string;
  children: ReactNode;
}) => (
  <Card elevation={0} sx={{ height: "100%" }}>
    <CardHeader
      avatar={icon}
      title={title}
      subheader={subheader}
      titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
    />
    <Divider />
    <CardContent>{children}</CardContent>
  </Card>
);

const SwitchRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <FormControlLabel
    labelPlacement="start"
    sx={{ mx: 0, justifyContent: "space-between", gap: 2 }}
    control={
      <Switch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    }
    label={
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    }
  />
);

const SettingsPage = () => {
  const { showSuccess, showError } = useToast();
  const { setMode } = useThemeMode();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const timezoneOptions = useMemo(getTimezoneOptions, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        setSettings(response.settings);
      } catch (err) {
        showError(
          (err as { message?: string })?.message || "Failed to load settings",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showError]);

  // Optimistically apply one field, save it, and roll back on failure.
  const saveSetting = async <S extends SettingsSection>(
    section: S,
    field: keyof UserSettings[S],
    value: UserSettings[S][keyof UserSettings[S]],
  ) => {
    if (!settings) return;
    const previous = settings;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [field]: value },
    });

    try {
      const response = await settingsService.updateSettings({
        [section]: { [field]: value },
      });
      setSettings(response.settings);
      showSuccess("Settings saved");
    } catch (err) {
      setSettings(previous);
      showError(
        (err as { message?: string })?.message || "Failed to save settings",
      );
    }
  };

  const handleThemeChange = (theme: ThemePreference) => {
    setMode(resolveThemeMode(theme));
    saveSetting("preferences", "theme", theme);
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const response = await settingsService.resetSettings();
      setSettings(response.settings);
      setMode(resolveThemeMode(response.settings.preferences.theme));
      showSuccess("Settings reset to defaults");
      setResetOpen(false);
    } catch (err) {
      showError(
        (err as { message?: string })?.message || "Failed to reset settings",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences, privacy and account security"
        action={
          <ResponsiveButton
            collapseBreakpoint="sm"
            variant="outlined"
            icon={<RestartAlt />}
            onClick={() => setResetOpen(true)}
            disabled={!settings}
          >
            Reset to Defaults
          </ResponsiveButton>
        }
      />

      {loading && (
        <SkeletonLoader count={3} minItemWidth={320} gap={3} lines={4} />
      )}

      {!loading && settings && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingsCard
              icon={<Palette color="primary" />}
              title="Preferences"
              subheader="Appearance and regional formats"
            >
              <Stack spacing={2.5}>
                <Select
                  label="Theme"
                  value={settings.preferences.theme}
                  options={THEME_OPTIONS}
                  onChange={(event) =>
                    handleThemeChange(event.target.value as ThemePreference)
                  }
                />
                <Select
                  label="Language"
                  value={settings.preferences.language}
                  options={LANGUAGE_OPTIONS}
                  onChange={(event) =>
                    saveSetting("preferences", "language", event.target.value)
                  }
                />
                <Select
                  label="Timezone"
                  value={settings.preferences.timezone}
                  options={timezoneOptions}
                  onChange={(event) =>
                    saveSetting("preferences", "timezone", event.target.value)
                  }
                  SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 320 } } } }}
                />
                <Select
                  label="Date Format"
                  value={settings.preferences.dateFormat}
                  options={DATE_FORMAT_OPTIONS}
                  onChange={(event) =>
                    saveSetting(
                      "preferences",
                      "dateFormat",
                      event.target.value as UserSettings["preferences"]["dateFormat"],
                    )
                  }
                />
              </Stack>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard
              icon={<NotificationsActive color="primary" />}
              title="Notifications"
              subheader="Choose what we email you about"
            >
              <Stack spacing={1.5}>
                {NOTIFICATION_ROWS.map((row) => (
                  <SwitchRow
                    key={row.key}
                    label={row.label}
                    description={row.description}
                    checked={settings.notifications[row.key]}
                    onChange={(checked) =>
                      saveSetting("notifications", row.key, checked)
                    }
                  />
                ))}
              </Stack>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingsCard
              icon={<VisibilityOutlined color="primary" />}
              title="Portfolio Privacy"
              subheader="Control what visitors see on your public portfolio"
            >
              <Stack spacing={2}>
                <Select
                  label="Portfolio Visibility"
                  value={settings.privacy.portfolioVisibility}
                  options={VISIBILITY_OPTIONS}
                  onChange={(event) =>
                    saveSetting(
                      "privacy",
                      "portfolioVisibility",
                      event.target.value as UserSettings["privacy"]["portfolioVisibility"],
                    )
                  }
                />
                {PRIVACY_ROWS.map((row) => (
                  <SwitchRow
                    key={row.key}
                    label={row.label}
                    checked={settings.privacy[row.key]}
                    onChange={(checked) =>
                      saveSetting("privacy", row.key, checked)
                    }
                  />
                ))}
              </Stack>
            </SettingsCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ChangePasswordCard />
          </Grid>

          <Grid item xs={12}>
            <DeleteAccountCard />
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={resetOpen}
        title="Reset Settings"
        message="Reset all preferences, notifications and privacy settings to their defaults?"
        confirmText="Reset"
        cancelText="Cancel"
        confirmColor="warning"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
        loading={resetting}
      />
    </Box>
  );
};

export default SettingsPage;
