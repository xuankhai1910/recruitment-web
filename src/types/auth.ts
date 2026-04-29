export interface Permission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface UserRole {
  _id: string;
  name: string;
}

export interface UserCompany {
  _id: string;
  name: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: UserCompany;
  permissions: Permission[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  age: number;
  gender: string;
  role: string;
  company?: { _id: string; name: string };
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  user: AuthUser;
}

export interface AccountResponse {
  user: AuthUser;
}
