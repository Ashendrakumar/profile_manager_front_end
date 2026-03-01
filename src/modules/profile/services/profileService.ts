/**
 * Profile Service
 * API service for profile-related operations
 */

import { apiService } from '@/services/api';

// ==================== Contact Details ====================

export interface Phone {
    number: string;
    type: 'mobile' | 'home' | 'work';
}

export interface Address {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    type: 'home' | 'work';
}

export interface SocialLink {
    platform: string;
    url: string;
}

export interface ContactDetails {
    email: string;
    phones: Phone[];
    addresses: Address[];
    socialLinks: SocialLink[];
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

// ==================== Experience ====================

export interface Experience {
    _id?: string;
    companyName: string;
    role: string;
    startDate: string;
    endDate?: string;
    isCurrentlyWorking: boolean;
    responsibilities: string[];
    technologiesUsed: string[];
}

export interface CreateExperienceRequest {
    companyName: string;
    role: string;
    startDate: string;
    endDate?: string | null;
    isCurrentlyWorking?: boolean;
    responsibilities?: string[];
    technologiesUsed?: string[];
}

export interface UpdateExperienceRequest {
    companyName?: string;
    role?: string;
    startDate?: string;
    endDate?: string | null;
    isCurrentlyWorking?: boolean;
    responsibilities?: string[];
    technologiesUsed?: string[];
}

// ==================== Projects ====================

export interface Project {
    _id?: string;
    title: string;
    description: string;
    technologies: string[];
    projectUrl?: string;
    githubRepo?: string;
}

export interface CreateProjectRequest {
    title: string;
    description: string;
    technologies?: string[];
    projectUrl?: string;
    githubRepo?: string;
}

export interface UpdateProjectRequest {
    title?: string;
    description?: string;
    technologies?: string[];
    projectUrl?: string;
    githubRepo?: string;
}

// ==================== Skills ====================

export interface Skill {
    _id?: string;
    name: string;
    category: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsOfExperience?: number;
}

export interface CreateSkillRequest {
    name: string;
    category: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsOfExperience?: number;
}

export interface UpdateSkillRequest {
    name?: string;
    category?: string;
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsOfExperience?: number;
}

/**
 * Profile Service
 * Provides methods to interact with profile API endpoints
 */
export const profileService = {
    // Contact Details
    getContactDetails: async (): Promise<{ contactDetails: ContactDetails | null; }> => {
        return apiService.get<{ contactDetails: ContactDetails | null; }>('/profile/contact');
    },

    updateContactDetails: async (
        data: UpdateContactDetailsRequest
    ): Promise<{ message: string; contactDetails: ContactDetails; }> => {
        return apiService.put<{ message: string; contactDetails: ContactDetails; }>('/profile/contact', data);
    },

    // Education
    getEducation: async (): Promise<{ education: Education[]; }> => {
        return apiService.get<{ education: Education[]; }>('/profile/education');
    },

    addEducation: async (
        data: CreateEducationRequest
    ): Promise<{ message: string; education: Education; }> => {
        return apiService.post<{ message: string; education: Education; }>('/profile/education', data);
    },

    updateEducation: async (
        educationId: string,
        data: UpdateEducationRequest
    ): Promise<{ message: string; education: Education; }> => {
        return apiService.put<{ message: string; education: Education; }>(
            `/profile/education/${educationId}`,
            data
        );
    },

    deleteEducation: async (educationId: string): Promise<{ message: string; }> => {
        return apiService.delete<{ message: string; }>(`/profile/education/${educationId}`);
    },

    // Experience
    getExperience: async (): Promise<{ experience: Experience[]; }> => {
        return apiService.get<{ experience: Experience[]; }>('/profile/experience');
    },

    addExperience: async (
        data: CreateExperienceRequest
    ): Promise<{ message: string; experience: Experience; }> => {
        if (!data.endDate || data.isCurrentlyWorking) {
            delete data.endDate;
        }
        return apiService.post<{ message: string; experience: Experience; }>('/profile/experience', data);
    },

    updateExperience: async (
        experienceId: string,
        data: UpdateExperienceRequest
    ): Promise<{ message: string; experience: Experience; }> => {
        if (!data.endDate || data.isCurrentlyWorking) {
            delete data.endDate;
        }
        return apiService.put<{ message: string; experience: Experience; }>(
            `/profile/experience/${experienceId}`,
            data
        );
    },

    deleteExperience: async (experienceId: string): Promise<{ message: string; }> => {
        return apiService.delete<{ message: string; }>(`/profile/experience/${experienceId}`);
    },

    // Projects
    getProjects: async (): Promise<{ projects: Project[]; }> => {
        return apiService.get<{ projects: Project[]; }>('/profile/projects');
    },

    addProject: async (
        data: CreateProjectRequest
    ): Promise<{ message: string; project: Project; }> => {
        return apiService.post<{ message: string; project: Project; }>('/profile/projects', data);
    },

    updateProject: async (
        projectId: string,
        data: UpdateProjectRequest
    ): Promise<{ message: string; project: Project; }> => {
        return apiService.put<{ message: string; project: Project; }>(
            `/profile/projects/${projectId}`,
            data
        );
    },

    deleteProject: async (projectId: string): Promise<{ message: string; }> => {
        return apiService.delete<{ message: string; }>(`/profile/projects/${projectId}`);
    },

    // Skills
    getSkills: async (): Promise<{ skills: Skill[]; }> => {
        return apiService.get<{ skills: Skill[]; }>('/profile/skills');
    },

    addSkill: async (
        data: CreateSkillRequest
    ): Promise<{ message: string; skill: Skill; }> => {
        return apiService.post<{ message: string; skill: Skill; }>('/profile/skills', data);
    },

    updateSkill: async (
        skillId: string,
        data: UpdateSkillRequest
    ): Promise<{ message: string; skill: Skill; }> => {
        return apiService.put<{ message: string; skill: Skill; }>(
            `/profile/skills/${skillId}`,
            data
        );
    },

    deleteSkill: async (skillId: string): Promise<{ message: string; }> => {
        return apiService.delete<{ message: string; }>(`/profile/skills/${skillId}`);
    },
};
