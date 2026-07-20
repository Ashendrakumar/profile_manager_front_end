/**
 * Profile Service
 * API service for profile-related operations
 */

import { apiService } from "@/services/api";

// ==================== Personal Details ====================

export interface ResumeItem {
  _id: string;
  fileName: string;
  filePath: string;
  downloadUrl: string;
  isPrimary: boolean;
  uploadedAt?: string;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  profileName: string;
  jobRole: string;
  profileDescription?: string;
  avatarUrl?: string;
  resumes?: ResumeItem[];
}

export interface UpdatePersonalDetailsRequest {
  firstName?: string;
  lastName?: string;
  profileName?: string;
  jobRole?: string;
}

// ==================== Contact Details ====================

export interface Phone {
  number: string;
  type: "mobile" | "home" | "work";
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  type: "home" | "work";
}

export interface SocialLink {
  platform: "linkedin" | "github" | "twitter" | "portfolio";
  url: string;
}

export interface ContactDetails {
  email: string;
  phones: Phone[];
  addresses: Address[];
  socialLinks: SocialLink[];
  resumeDownloadUrl?: string;
}

export interface UpdateContactDetailsRequest {
  email?: string;
  phones?: Phone[];
  addresses?: Address[];
  socialLinks?: SocialLink[];
}

// ==================== Education ====================

export interface Education {
  _id?: string;
  standard: string;
  institution: string;
  university?: string;
  passingYear: number;
  grade?: string;
  specialization?: string;
}

export interface CreateEducationRequest {
  standard: string;
  institution: string;
  university?: string;
  passingYear: number;
  grade?: string;
  specialization?: string;
}

export interface UpdateEducationRequest {
  standard?: string;
  institution?: string;
  university?: string;
  passingYear?: number;
  grade?: string;
  specialization?: string;
}

// ==================== Certifications ====================

export interface Certification {
  _id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface CreateCertificationRequest {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface UpdateCertificationRequest {
  title?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

// ==================== Experience ====================

export interface ExperienceProjectLink {
  projectId: string;
  title: string;
}

export interface Experience {
  _id?: string;
  companyName: string;
  role: string;
  roleDescription?: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  responsibilities: string[];
  technologiesUsed: string[];
  projects?: ExperienceProjectLink[];
}

export interface CreateExperienceRequest {
  companyName: string;
  role: string;
  roleDescription?: string;
  startDate: string;
  endDate?: string | null;
  isCurrentlyWorking?: boolean;
  responsibilities?: string[];
  technologiesUsed?: string[];
  projects?: ExperienceProjectLink[];
}

export interface UpdateExperienceRequest {
  companyName?: string;
  role?: string;
  roleDescription?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrentlyWorking?: boolean;
  responsibilities?: string[];
  technologiesUsed?: string[];
  projects?: ExperienceProjectLink[];
}

// ==================== Projects ====================

export interface Project {
  _id?: string;
  title: string;
  description: string;
  projectType: "Personal" | "Professional";
  company?: string;
  technologies: string[];
  projectUrl?: string;
  githubRepo?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  projectType: "Personal" | "Professional";
  company?: string;
  technologies?: string[];
  projectUrl?: string;
  githubRepo?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  projectType?: "Personal" | "Professional";
  company?: string;
  technologies?: string[];
  projectUrl?: string;
  githubRepo?: string;
}

// ==================== Skills ====================

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface Skill {
  _id?: string;
  name: string;
  category: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface Portfolio {
  link: string;
  isGenerated: boolean;
}

// ==================== Profile Completion ====================

export interface ProfileCompletion {
  percentage: number;
  completedSections: string[];
  missingSections: { label: string; key: string }[];
  lastCalculatedAt: Date;
}

export interface CreateSkillRequest {
  name: string;
  category: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface UpdateSkillRequest {
  name?: string;
  category?: string;
  level?: SkillLevel;
  yearsOfExperience?: number;
}

/**
 * Profile Service
 * Provides methods to interact with profile API endpoints
 */
export const profileService = {
  // Personal Details
  getPersonalDetails: async (): Promise<{
    personalDetails: PersonalDetails;
  }> => {
    return apiService.get<{ personalDetails: PersonalDetails }>(
      `/profile/personal-details`,
    );
  },

  updatePersonalDetails: async (
    data: UpdatePersonalDetailsRequest,
  ): Promise<{ message: string; personalDetails: PersonalDetails }> => {
    return apiService.post<{
      message: string;
      personalDetails: PersonalDetails;
    }>("/profile/save-personal-details", data);
  },

  // Contact Details
  getContactDetails: async (): Promise<{
    contactDetails: ContactDetails | null;
  }> => {
    return apiService.get<{ contactDetails: ContactDetails | null }>(
      "/profile/contact",
    );
  },

  updateContactDetails: async (
    data: UpdateContactDetailsRequest,
  ): Promise<{ message: string; contactDetails: ContactDetails }> => {
    return apiService.put<{ message: string; contactDetails: ContactDetails }>(
      "/profile/contact",
      data,
    );
  },

  // Education
  getEducation: async (): Promise<{ education: Education[] }> => {
    return apiService.get<{ education: Education[] }>("/profile/education");
  },

  addEducation: async (
    data: CreateEducationRequest,
  ): Promise<{ message: string; education: Education }> => {
    return apiService.post<{ message: string; education: Education }>(
      "/profile/education",
      data,
    );
  },

  updateEducation: async (
    educationId: string,
    data: UpdateEducationRequest,
  ): Promise<{ message: string; education: Education }> => {
    return apiService.put<{ message: string; education: Education }>(
      `/profile/education/${educationId}`,
      data,
    );
  },

  deleteEducation: async (
    educationId: string,
  ): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(
      `/profile/education/${educationId}`,
    );
  },

  // Certifications
  getCertifications: async (): Promise<{ certifications: Certification[] }> => {
    return apiService.get<{ certifications: Certification[] }>(
      "/profile/certifications",
    );
  },

  addCertification: async (
    data: CreateCertificationRequest,
  ): Promise<{ message: string; certification: Certification }> => {
    return apiService.post<{ message: string; certification: Certification }>(
      "/profile/certifications",
      data,
    );
  },

  updateCertification: async (
    certificationId: string,
    data: UpdateCertificationRequest,
  ): Promise<{ message: string; certification: Certification }> => {
    return apiService.put<{ message: string; certification: Certification }>(
      `/profile/certifications/${certificationId}`,
      data,
    );
  },

  deleteCertification: async (
    certificationId: string,
  ): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(
      `/profile/certifications/${certificationId}`,
    );
  },

  // Experience
  getExperience: async (): Promise<{ experience: Experience[] }> => {
    return apiService.get<{ experience: Experience[] }>("/profile/experience");
  },

  addExperience: async (
    data: CreateExperienceRequest,
  ): Promise<{ message: string; experience: Experience }> => {
    if (!data.endDate || data.isCurrentlyWorking) {
      delete data.endDate;
    }
    return apiService.post<{ message: string; experience: Experience }>(
      "/profile/experience",
      data,
    );
  },

  updateExperience: async (
    experienceId: string,
    data: UpdateExperienceRequest,
  ): Promise<{ message: string; experience: Experience }> => {
    if (!data.endDate || data.isCurrentlyWorking) {
      delete data.endDate;
    }
    return apiService.put<{ message: string; experience: Experience }>(
      `/profile/experience/${experienceId}`,
      data,
    );
  },

  deleteExperience: async (
    experienceId: string,
  ): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(
      `/profile/experience/${experienceId}`,
    );
  },

  getCompanies: async (): Promise<{
    companies: Array<{ companyName: string; id: string }>;
  }> => {
    return apiService.get<{
      companies: Array<{ companyName: string; id: string }>;
    }>("/profile/experience/companies");
  },

  // Projects
  getProjects: async (): Promise<{ projects: Project[] }> => {
    return apiService.get<{ projects: Project[] }>("/profile/projects");
  },

  addProject: async (
    data: CreateProjectRequest,
  ): Promise<{ message: string; project: Project }> => {
    return apiService.post<{ message: string; project: Project }>(
      "/profile/projects",
      data,
    );
  },

  updateProject: async (
    projectId: string,
    data: UpdateProjectRequest,
  ): Promise<{ message: string; project: Project }> => {
    return apiService.put<{ message: string; project: Project }>(
      `/profile/projects/${projectId}`,
      data,
    );
  },

  deleteProject: async (projectId: string): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(
      `/profile/projects/${projectId}`,
    );
  },

  // Skills
  getSkills: async (): Promise<{ skills: Skill[] }> => {
    return apiService.get<{ skills: Skill[] }>("/profile/skills");
  },

  addSkill: async (
    data: CreateSkillRequest,
  ): Promise<{ message: string; skill: Skill }> => {
    return apiService.post<{ message: string; skill: Skill }>(
      "/profile/skills",
      data,
    );
  },

  updateSkill: async (
    skillId: string,
    data: UpdateSkillRequest,
  ): Promise<{ message: string; skill: Skill }> => {
    return apiService.put<{ message: string; skill: Skill }>(
      `/profile/skills/${skillId}`,
      data,
    );
  },

  deleteSkill: async (skillId: string): Promise<{ message: string }> => {
    return apiService.delete<{ message: string }>(`/profile/skills/${skillId}`);
  },

  generatePortfolioLink: async (): Promise<{ data: Portfolio }> => {
    return apiService.post<{ data: Portfolio }>(`/portfolio/generate`);
  },

  uploadProfileImage: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; profileImage: string }> => {
    const formData = new FormData();
    formData.append("profiles", file);
    return apiService.post<{ message: string; profileImage: string }>(
      "/upload/profile-upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
  },

  // Resume (multiple resumes per user, one marked primary)
  uploadResume: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; resumes: ResumeItem[] }> => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiService.post<{ message: string; resumes: ResumeItem[] }>(
      "/upload/resume-upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
  },

  getResumes: async (): Promise<{ resumes: ResumeItem[] }> => {
    return apiService.get<{ resumes: ResumeItem[] }>("/upload/resumes");
  },

  setPrimaryResume: async (
    resumeId: string,
  ): Promise<{ message: string; resumes: ResumeItem[] }> => {
    return apiService.patch<{ message: string; resumes: ResumeItem[] }>(
      `/upload/resume/${resumeId}/primary`,
    );
  },

  deleteResume: async (
    resumeId: string,
  ): Promise<{ message: string; resumes: ResumeItem[] }> => {
    return apiService.delete<{ message: string; resumes: ResumeItem[] }>(
      `/upload/resume/${resumeId}`,
    );
  },

  // Profile Completion
  getProfileCompletion: async (): Promise<{
    profileCompletion: ProfileCompletion;
  }> => {
    return apiService.get<{ profileCompletion: ProfileCompletion }>(
      "/profile/completion",
    );
  },
};
