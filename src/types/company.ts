export interface Company {
  _id: string;
  name: string;
  address: string;
  description: string;
  logo: string;
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
}

export interface UpdateCompanyDto {
  name?: string;
  address?: string;
  description?: string;
  logo?: string;
}
