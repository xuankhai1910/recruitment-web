export type NotificationType =
  | "NEW_RESUME_RECEIVED"
  | "RESUME_SUBMITTED"
  | "RESUME_STATUS_CHANGED";

export type NotificationResumeStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED";

export type NotificationRecipientRole =
  | "USER"
  | "HR"
  | "COMPANY_ADMIN"
  | "ADMIN";

export interface NotificationData {
  resumeId?: string;
  jobId?: string;
  jobName?: string;
  companyId?: string;
  companyName?: string;
  applicantId?: string;
  applicantName?: string;
  applicantEmail?: string;
  status?: NotificationResumeStatus;
  submittedAt?: string;
  updatedAt?: string;
}

export interface AppNotification {
  _id: string;
  recipientId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  ctaUrl: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  current?: number;
  pageSize?: number;
  sort?: string;
  isRead?: boolean;
  type?: NotificationType;
}
