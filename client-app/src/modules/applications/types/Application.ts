export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export interface Application {
  id: number;
  position: string;
  company: string;
  link?: string | null;
  notes?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ApplicationCreateDto {
  position: string;
  company: string;
  link?: string | null;
  notes?: string | null;
  status: ApplicationStatus;
}

export interface ApplicationUpdateDto {
  position: string;
  company: string;
  link?: string | null;
  notes?: string | null;
  status: ApplicationStatus;
}
