export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Project {
  name: string;
  role: string;
  techStack: string[];
  description: string;
  url?: string;
}

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface ProfileSkill {
  name: string;
  level: SkillLevel;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
}

export interface ProfileLanguage {
  name: string;
  proficiency: string;
}

export interface ProfileReference {
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
}

export type CvTemplate = "modern" | "classic" | "minimal";

export interface UserProfile {
  _id: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: ProfileSkill[];
  certifications: Certification[];
  awards: Award[];
  languages: ProfileLanguage[];
  references: ProfileReference[];
  templateId: CvTemplate | string;
  isPublic: boolean;
  completionScore: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicProfile = Omit<UserProfile, "references"> & {
  references?: ProfileReference[];
};

export interface PublicUserProfileResponse {
  user: {
    _id: string;
    name?: string;
    isJobSeeking: boolean;
  };
  profile: PublicProfile;
}

export type UpsertUserProfileDto = Omit<
  UserProfile,
  "_id" | "userId" | "completionScore" | "createdAt" | "updatedAt"
>;
