export interface ResumeHistory {
  status: string;
  updatedAt: string;
  updatedBy: { _id: string; email: string };
}

export interface Resume {
  _id: string;
  url: string;
  email: string;
  userId: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  companyId: string | { _id: string; name: string };
  jobId: string | { _id: string; name: string };
  history: ResumeHistory[];
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface CreateResumeDto {
  url: string;
  companyId: string;
  jobId: string;
}

export interface UpdateResumeStatusDto {
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
}
