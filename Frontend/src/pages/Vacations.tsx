import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../store";
import { loadVacations, toggleLikeLocal } from "../store/vacationsSlice";
import * as vacationsService from "../services/vacations.service";
import { getErrorMessage } from "../api/client";
import VacationCard from "../components/VacationCard/VacationCard";
import type { Vacation, VacationFilter } from "../types/vacation.types";

const FILTERS: { key: VacationFilter; label: string }[] = [
  { key: "all", label: "All Vacations" },
  { key: "liked", label: "My Liked" },
  { key: "active", label: "Active Now" },
  { key: "notStarted", label: "Not Started Yet" },
];

export default function Vacations() {
  const [params, setParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { items, loading, error, page, totalPages, total } = useAppSelector(
    (s) => s.vacations
  );

  const filter = (params.get("filter") as VacationFilter) || "all";
  const currentPage = Math.max(1, Number(params.get("page")) || 1);

  useEffect(() => {
    dispatch(loadVacations({ filter, page: currentPage }));
  }, [dispatch, filter, currentPage]);

  const setFilter = (f: VacationFilter) => {
    setParams({ filter: f, page: "1" });
  };
  const goToPage = (p: number) => {
    setParams({ filter, page: String(p) });
  };

  const handleToggleLike = async (v: Vacation) => {
    const nextLiked = !v.is_liked;
    dispatch(toggleLikeLocal({ vacationId: v.vacation_id, liked: nextLiked }));
    try {
      if (nextLiked) await vacationsService.addLike(v.vacation_id);
      else await vacationsService.removeLike(v.vacation_id);
      // In the "liked" view, an unlike should drop the card from the list.
      if (filter === "liked") {
        dispatch(loadVacations({ filter, page: currentPage }));
      }
    } catch (err) {
      // Roll back on failure.
      dispatch(toggleLikeLocal({ vacationId: v.vacation_id, liked: !nextLiked }));
      toast.error(getErrorMessage(err, "Could not update like"));
    }
  };

  return (
    <div className="page">
      <h1>Explore Vacations</h1>
      <p className="subtitle">
        {total} vacation{total === 1 ? "" : "s"} — find your next trip.
      </p>

      <div className="toolbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="center-note">
          <span className="spinner" /> Loading vacations…
        </div>
      ) : items.length === 0 ? (
        <div className="center-note">
          No vacations found for this filter.
        </div>
      ) : (
        <div className="grid">
          {items.map((v) => (
            <VacationCard
              key={v.vacation_id}
              vacation={v}
              mode="user"
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn secondary small"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn secondary small"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
