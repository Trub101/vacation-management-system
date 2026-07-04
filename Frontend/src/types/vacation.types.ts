export interface Vacation {
  vacation_id: number;
  destination: string;
  description: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  price: number;
  image_filename: string;
  likes_count: number;
  is_liked: boolean;
}

export type VacationFilter = "all" | "liked" | "active" | "notStarted";

export interface PaginatedVacations {
  items: Vacation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VacationReportRow {
  destination: string;
  likes_count: number;
}
