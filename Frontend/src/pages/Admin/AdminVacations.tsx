import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as vacationsService from "../../services/vacations.service";
import { getErrorMessage } from "../../api/client";
import VacationCard from "../../components/VacationCard/VacationCard";
import type { Vacation } from "../../types/vacation.types";

export default function AdminVacations() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = Math.max(1, Number(params.get("page")) || 1);

  const [items, setItems] = useState<Vacation[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vacationsService.fetchVacations("all", currentPage, 9);
      setItems(res.items);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load vacations"));
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (v: Vacation) => {
    if (!window.confirm(`Delete "${v.destination}"? This cannot be undone.`)) return;
    try {
      await vacationsService.deleteVacation(v.vacation_id);
      toast.success("Vacation deleted");
      // If we removed the last card on a page, step back a page.
      if (items.length === 1 && currentPage > 1) {
        setParams({ page: String(currentPage - 1) });
      } else {
        load();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <div className="page">
      <div className="toolbar">
        <div>
          <h1>Admin — Vacations</h1>
          <p className="subtitle" style={{ margin: 0 }}>{total} total vacations</p>
        </div>
        <div className="spacer" />
        <button className="btn" onClick={() => navigate("/admin/vacations/add")}>
          + Add New Vacation
        </button>
      </div>

      {loading ? (
        <div className="center-note"><span className="spinner" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="center-note">No vacations yet. Add your first one.</div>
      ) : (
        <div className="grid">
          {items.map((v) => (
            <VacationCard
              key={v.vacation_id}
              vacation={v}
              mode="admin"
              onEdit={(vac) => navigate(`/admin/vacations/edit/${vac.vacation_id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn secondary small" disabled={currentPage <= 1}
            onClick={() => setParams({ page: String(currentPage - 1) })}>← Prev</button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button className="btn secondary small" disabled={currentPage >= totalPages}
            onClick={() => setParams({ page: String(currentPage + 1) })}>Next →</button>
        </div>
      )}
    </div>
  );
}
