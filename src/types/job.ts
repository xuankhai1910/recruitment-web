export interface JobSalary {
  min?: number;
  max?: number;
  isNegotiable: boolean;
  currency: string;
}

export interface JobYearsOfExperience {
  min?: number;
  max?: number;
}

export interface Job {
  _id: string;
  name: string;
  category: string;
  specialization: string;
  skills: string[];
  company: {
    _id: string;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
  };
  location: string;
  salary: JobSalary;
  quantity: number;
  level: string;
  jobType: string;
  workMode: string;
  yearsOfExperience?: JobYearsOfExperience;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface JobSalaryInput {
  min?: number;
  max?: number;
  isNegotiable: boolean;
}

export interface CreateJobDto {
  name: string;
  category: string;
  specialization: string;
  skills: string[];
  company: {
    _id: string;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
  };
  location: string;
  salary: JobSalaryInput;
  quantity: number;
  level: string;
  jobType?: string;
  workMode?: string;
  yearsOfExperience?: JobYearsOfExperience;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface JobTaxonomy {
  categories: string[];
  specializationsByCategory: Record<string, string[]>;
  levels: string[];
  jobTypes: string[];
  workModes: string[];
}
