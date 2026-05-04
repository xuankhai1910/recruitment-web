export interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  age: number;
  gender: string;
  role: { _id: string; name: string };
  company?: { _id: string; name: string };
  isJobSeeking?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  address: string;
  role: string;
  age: number;
  gender: string;
  company?: { _id: string; name: string };
}

export interface UpdateUserDto {
  name?: string;
  address?: string;
  age?: number;
  gender?: string;
  role?: string;
  company?: { _id: string; name: string };
}
