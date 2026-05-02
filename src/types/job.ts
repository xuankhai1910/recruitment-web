export interface Job {
  _id: string;
  name: string;
  skills: string[];
  company: {
    _id: string;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
  };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface CreateJobDto {
  name: string;
  skills: string[];
  company: {
    _id: string;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
  };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
