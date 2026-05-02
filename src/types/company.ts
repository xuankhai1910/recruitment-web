export interface Company {
  _id: string;
  name: string;
  address: string;
  description: string;
  logo: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface CreateCompanyDto {
  name: string;
  address: string;
  description: string;
  logo: string;
  email: string;
  phone: string;
}

export interface UpdateCompanyDto {
  name?: string;
  address?: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
}
