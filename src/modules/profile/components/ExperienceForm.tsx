/**
 * ExperienceForm Component
 * Form for creating and editing experience entries
 */

import { useEffect } from "react";
import {
  Box,
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
import TextEditor from "@/common/components/TextEditor";
import { SideDrawer } from "@/common/components/SideDrawer";
import { Input } from "@/common/components";

type ExperienceFormData = {
  companyName: string;
  role: string;
  roleDescription?: string;
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
      roleDescription: "",
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
        roleDescription: experience.roleDescription || "",
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
        roleDescription: "",
        startDate: "",
        endDate: "",
        isCurrentlyWorking: false,
        responsibilities: [],
        technologiesUsed: [],
      });
    }
  }, [experience, reset, open]);

  return (
    <SideDrawer
      open={open}
      onClose={loading ? undefined : onClose}
      title={experience ? "Edit Experience" : "Add Experience"}
      subTitle={experience ? experience.companyName : ""}
      loading={loading}
      footerActionClick={handleSubmit(onSubmit)}
      footerActionName={experience ? "Save" : "Add"}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        <Input
          label="Company Name"
          name="companyName"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Input
          label="Role/Position"
          name="role"
          register={register}
          errors={errors}
          disabled={loading}
        />
        <Controller
          control={control}
          name="roleDescription"
          render={({ field, fieldState }) => (
            <Box>
              <TextEditor
                isNormalField
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter role description"
                className={fieldState.error ? "editor-error" : ""}
                style={{
                  border: fieldState.error ? "1px solid #d32f2f" : "none",
                  borderRadius: "4px",
                }}
              />
              {fieldState.error && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {fieldState.error.message}
                </Typography>
              )}
            </Box>
          )}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
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
              <Input
                label=""
                name={`responsibilities.${index}`}
                placeholder="Enter responsibility"
                register={register}
                errors={errors}
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
              <Input
                label=""
                name={`technologiesUsed.${index}`}
                placeholder="Enter technology"
                register={register}
                errors={errors}
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
    </SideDrawer>
  );
};
