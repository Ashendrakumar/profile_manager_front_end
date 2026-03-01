/**
 * ExperienceForm Component
 * Form for creating and editing experience entries
 */

import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema } from "../utils/validation";
import type { Experience } from "../services/profileService";
import { Add, Remove } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

type ExperienceFormData = {
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking?: boolean;
  responsibilities: string[];
  technologiesUsed: string[];
};

interface ExperienceFormProps {
  open: boolean;
  experience?: Experience | null;
  onClose: () => void;
  onSubmit: (data: ExperienceFormData) => Promise<void>;
  loading?: boolean;
}

export const ExperienceForm = ({
  open,
  experience,
  onClose,
  onSubmit,
  loading = false,
}: ExperienceFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      companyName: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrentlyWorking: false,
      responsibilities: [],
      technologiesUsed: [],
    },
  });

  const isCurrentlyWorking = watch("isCurrentlyWorking");

  const {
    fields: responsibilityFields,
    append: appendResponsibility,
    remove: removeResponsibility,
  } = useFieldArray({
    control: control as any,
    name: "responsibilities",
  });

  const {
    fields: technologyFields,
    append: appendTechnology,
    remove: removeTechnology,
  } = useFieldArray({
    control: control as any,
    name: "technologiesUsed",
  });

  useEffect(() => {
    if (experience) {
      reset({
        companyName: experience.companyName || "",
        role: experience.role || "",
        startDate: experience.startDate
          ? experience.startDate.split("T")[0]
          : "",
        endDate: experience.endDate ? experience.endDate.split("T")[0] : "",
        isCurrentlyWorking: experience.isCurrentlyWorking || false,
        responsibilities: experience.responsibilities || [],
        technologiesUsed: experience.technologiesUsed || [],
      });
    } else {
      reset({
        companyName: "",
        role: "",
        startDate: "",
        endDate: "",
        isCurrentlyWorking: false,
        responsibilities: [],
        technologiesUsed: [],
      });
    }
  }, [experience, reset, open]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {experience ? "Edit Experience" : "Add Experience"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Company Name"
              fullWidth
              {...register("companyName")}
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
              disabled={loading}
            />
            <TextField
              label="Role/Position"
              fullWidth
              {...register("role")}
              error={!!errors.role}
              helperText={errors.role?.message}
              disabled={loading}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Start Date"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                        fullWidth: true, // Ensuring it matches the layout expectation
                      },
                    }}
                    disabled={loading}
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="End Date"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) =>
                      field.onChange(date ? date.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      field: { clearable: true },
                      textField: {
                        size: "small",
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                        fullWidth: true, // Ensuring it matches the layout expectation
                      },
                    }}
                    disabled={loading || isCurrentlyWorking}
                  />
                )}
              />
            </Box>
            <FormControlLabel
              control={<Checkbox {...register("isCurrentlyWorking")} />}
              label="Currently Working Here"
              disabled={loading}
            />
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">Responsibilities</Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => appendResponsibility("")}
                  disabled={loading}
                >
                  <Add />
                </IconButton>
              </Box>
              {responsibilityFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 1,
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter responsibility"
                    {...register(`responsibilities.${index}`)}
                    disabled={loading}
                  />
                  <Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeResponsibility(index)}
                      disabled={loading}
                    >
                      <Remove />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">Technologies Used</Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => appendTechnology("")}
                  disabled={loading}
                >
                  <Add />
                </IconButton>
              </Box>
              {technologyFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 1,
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter technology"
                    {...register(`technologiesUsed.${index}`)}
                    disabled={loading}
                  />
                  <Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeTechnology(index)}
                      disabled={loading}
                    >
                      <Remove />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {experience ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
