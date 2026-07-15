/**
 * CertificationSection Component
 * Manages certification entries (CRUD)
 */

import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Add, Edit, Delete, Verified } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import type { Certification } from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  EntityCard,
  type EntityCardChip,
  ResponsiveButton,
} from "@/common/components";
import { CertificationForm } from "./CertificationForm";
import { HelperFunctions } from "@/utils/helpers";

const dummyCertifications: Certification[] = [
  {
    _id: "cert-1",
    title: "AWS Certified Developer - Associate",
    issuer: "Amazon Web Services",
    issueDate: "2024-01-15",
    expiryDate: "2027-01-15",
    credentialId: "AWS-DEV-1234",
    credentialUrl: "https://aws.amazon.com/certification",
    description:
      "Validated expertise in building and deploying applications on AWS.",
  },
  {
    _id: "cert-2",
    title: "Google Cloud Professional Developer",
    issuer: "Google Cloud",
    issueDate: "2023-08-20",
    expiryDate: "2026-08-20",
    credentialId: "GCP-DEV-5678",
    credentialUrl: "https://cloud.google.com/certification",
    description:
      "Demonstrated strong cloud architecture and development skills.",
  },
];

const STORAGE_KEY = "profile-certifications";

export const CertificationSection = () => {
  const { showSuccess, showError } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>(() => {
    if (typeof globalThis.window === "undefined") return dummyCertifications;

    const stored = globalThis.window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return dummyCertifications;

    try {
      return JSON.parse(stored) as Certification[];
    } catch {
      return dummyCertifications;
    }
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] =
    useState<Certification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificationToDelete, setCertificationToDelete] =
    useState<Certification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const syncToStorage = (items: Certification[]) => {
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    }
  };

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const stored = globalThis.window?.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCertifications(JSON.parse(stored) as Certification[]);
      } else {
        setCertifications(dummyCertifications);
        syncToStorage(dummyCertifications);
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to fetch certifications",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCertification(null);
    setFormOpen(true);
  };

  const handleEdit = (certification: Certification) => {
    setSelectedCertification(certification);
    setFormOpen(true);
  };

  const handleDelete = (certification: Certification) => {
    setCertificationToDelete(certification);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);

      const nextItems = selectedCertification?._id
        ? certifications.map((item) =>
            item._id === selectedCertification._id
              ? { ...item, ...data }
              : item,
          )
        : [
            {
              _id: `cert-${Date.now()}`,
              ...data,
            } as Certification,
            ...certifications,
          ];

      setCertifications(nextItems);
      syncToStorage(nextItems);
      setFormOpen(false);
      setSelectedCertification(null);
      showSuccess(
        selectedCertification?._id
          ? "Certification updated successfully"
          : "Certification added successfully",
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save certification",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!certificationToDelete?._id) return;

    try {
      setActionLoading(true);
      const nextItems = certifications.filter(
        (item) => item._id !== certificationToDelete._id,
      );
      setCertifications(nextItems);
      syncToStorage(nextItems);
      showSuccess("Certification deleted successfully");
      setDeleteDialogOpen(false);
      setCertificationToDelete(null);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to delete certification",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const hasCertifications = certifications.length > 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Certifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your professional certifications
          </Typography>
        </Box>
        <ResponsiveButton
          collapseBreakpoint="sm"
          icon={<Add />}
          onClick={handleAdd}
        >
          Add
        </ResponsiveButton>
      </Box>

      {loading && (
        <SkeletonLoader count={3} minItemWidth={320} gap={2} lines={2} />
      )}

      {!hasCertifications && !loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No certifications yet. Add your first one!
          </Typography>
        </Box>
      ) : (
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 2,
          }}
        >
          {certifications.map((certification) => {
            const chips: EntityCardChip[] = [];
            if (certification.issueDate) {
              chips.push({ label: `Issued: ${certification.issueDate}` });
            }
            if (certification.expiryDate) {
              chips.push({ label: `Expires: ${certification.expiryDate}` });
            }
            if (certification.credentialId) {
              chips.push({
                label: certification.credentialId,
                color: "primary",
              });
            }

            return (
              <Grid key={certification._id}>
                <EntityCard
                  title={HelperFunctions.capitalizeString(certification.title)}
                  subtitle={HelperFunctions.capitalizeString(
                    certification.issuer,
                  )}
                  avatar={<Verified />}
                  info={[
                    ...(certification.credentialUrl
                      ? [{ text: certification.credentialUrl }]
                      : []),
                  ]}
                  chips={chips}
                  actions={[
                    {
                      label: "Edit",
                      icon: <Edit fontSize="small" />,
                      onClick: () => handleEdit(certification),
                    },
                    {
                      label: "Delete",
                      icon: <Delete fontSize="small" />,
                      color: "error",
                      dividerBefore: true,
                      onClick: () => handleDelete(certification),
                    },
                  ]}
                >
                  {certification.description && (
                    <Typography variant="body2" color="text.secondary">
                      {certification.description}
                    </Typography>
                  )}
                </EntityCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CertificationForm
        open={formOpen}
        certification={selectedCertification}
        onClose={() => {
          setFormOpen(false);
          setSelectedCertification(null);
        }}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Certification"
        message={`Are you sure you want to delete "${certificationToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setCertificationToDelete(null);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};
