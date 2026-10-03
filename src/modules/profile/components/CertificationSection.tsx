/**
 * CertificationSection Component
 * Manages certification entries (CRUD)
 */

import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Add, Edit, Delete, Verified } from "@mui/icons-material";
import { useToast } from "@/contexts/toastContext";
import {
  profileService,
  type Certification,
  type CreateCertificationRequest,
} from "../services/profileService";
import {
  ConfirmDialog,
  SkeletonLoader,
  EntityCard,
  type EntityCardChip,
  ResponsiveButton,
  PageHeader,
  EmptyState,
} from "@/common/components";
import { CertificationForm } from "./CertificationForm";
import { HelperFunctions } from "@/utils/helpers";

export const CertificationSection = () => {
  const { showSuccess, showError } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
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

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCertifications();
      setCertifications(response.certifications || []);
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

  const handleFormSubmit = async (data: CreateCertificationRequest) => {
    try {
      setActionLoading(true);

      if (selectedCertification?._id) {
        const { certification } = await profileService.updateCertification(
          selectedCertification._id,
          data,
        );
        setCertifications((items) =>
          items.map((item) =>
            item._id === certification._id ? certification : item,
          ),
        );
      } else {
        const { certification } = await profileService.addCertification(data);
        setCertifications((items) => [certification, ...items]);
      }

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
      await profileService.deleteCertification(certificationToDelete._id);
      setCertifications((items) =>
        items.filter((item) => item._id !== certificationToDelete._id),
      );
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

  // Most recently issued first.
  const sortedCertifications = useMemo(
    () =>
      HelperFunctions.sortByRecency(certifications, (item) => item.issueDate),
    [certifications],
  );

  return (
    <Box>
      <PageHeader
        title="Certifications"
        subtitle="Manage your professional certifications"
        count={certifications.length}
        action={
          <ResponsiveButton collapseBreakpoint="sm" icon={<Add />} onClick={handleAdd}>
            Add Certification
          </ResponsiveButton>
        }
      />

      {loading && (
        <SkeletonLoader count={3} minItemWidth={320} gap={3} lines={2} />
      )}

      {!hasCertifications && !loading ? (
        <EmptyState
          icon={<Verified />}
          title="No certifications yet"
          description="Add the certifications and credentials you've earned."
          onClick={handleAdd}
        />
      ) : (
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
          }}
        >
          {sortedCertifications.map((certification) => {
            const chips: EntityCardChip[] = [];
            if (certification.issueDate) {
              chips.push({ label: `Issued: ${certification.issueDate}` });
            }
            if (certification.expiryDate) {
              chips.push(
                certification.isExpired
                  ? { label: `Expired: ${certification.expiryDate}`, color: "error" }
                  : { label: `Expires: ${certification.expiryDate}` },
              );
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
