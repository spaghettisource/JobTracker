import api from "../../../api/axiosClient";
import type {
  Application,
  ApplicationCreateDto,
  ApplicationUpdateDto,
} from "../types/Application"

export interface ApplicationQueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "Position" | "Company" | "CreatedAt";
  sortDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function fetchApplications(
  params: ApplicationQueryParams = {}
): Promise<PagedResult<Application>> {
  const query = new URLSearchParams();

  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDirection) query.append("sortDirection", params.sortDirection);

  const res = await api.get<PagedResult<Application>>(`/applications/search?${query.toString()}`);
  return res.data;
}


export async function createApplication(
  data: ApplicationCreateDto
): Promise<Application> {
  const res = await api.post<Application>("/applications", data);
  return res.data;
}

export async function updateApplication(
  id: number,
  data: ApplicationUpdateDto
): Promise<Application> {
  const res = await api.put<Application>(`/applications/${id}`, data);
  return res.data;
}

export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}
