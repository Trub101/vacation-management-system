import { api } from "../api/client";
import type {
  PaginatedVacations,
  Vacation,
  VacationFilter,
  VacationReportRow,
} from "../types/vacation.types";

export async function fetchVacations(
  filter: VacationFilter,
  page: number,
  limit = 9
): Promise<PaginatedVacations> {
  const { data } = await api.get<PaginatedVacations>("/vacations", {
    params: { filter, page, limit },
  });
  return data;
}

export async function fetchVacation(id: number): Promise<Vacation> {
  const { data } = await api.get<Vacation>(`/vacations/${id}`);
  return data;
}

export async function createVacation(form: FormData): Promise<Vacation> {
  const { data } = await api.post<Vacation>("/vacations", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateVacation(
  id: number,
  form: FormData
): Promise<Vacation> {
  const { data } = await api.put<Vacation>(`/vacations/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteVacation(id: number): Promise<void> {
  await api.delete(`/vacations/${id}`);
}

export async function addLike(vacationId: number): Promise<void> {
  await api.post(`/likes/${vacationId}`);
}

export async function removeLike(vacationId: number): Promise<void> {
  await api.delete(`/likes/${vacationId}`);
}

export async function fetchLikesReport(): Promise<VacationReportRow[]> {
  const { data } = await api.get<VacationReportRow[]>("/vacations/reports/likes");
  return data;
}
