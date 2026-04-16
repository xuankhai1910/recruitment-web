export interface Role {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[] | { _id: string; name: string; apiPath: string; method: string; module: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
}
