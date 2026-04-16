export interface Permission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  apiPath: string;
  method: string;
  module: string;
}
