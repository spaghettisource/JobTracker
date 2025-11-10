// src/modules/applications/types/Application.ts

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

// ✅ Нови enum-и за сортиране и филтриране

export enum SortBy {
  Position = "Position",
  Company = "Company",
  CreatedAt = "CreatedAt",
}

export enum SortDirection {
  Asc = "asc",
  Desc = "desc",
}

// ✅ Query параметри, които ползваме при fetch
export interface ApplicationQueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
  sortDirection?: SortDirection;
}
