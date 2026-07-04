import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as vacationsService from "../../services/vacations.service";
import { getErrorMessage } from "../../api/client";
import type { VacationReportRow } from "../../types/vacation.types";

export default function Reports() {
  const [data, setData] = useState<VacationReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await vacationsService.fetchLikesReport());
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load report"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a CSV client-side from the already-fetched data and trigger download.
  const downloadCsv = () => {
    const header = "vacation_destination,likes_count";
    const rows = data.map(
      (r) => `"${r.destination.replace(/"/g, '""')}",${r.likes_count}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vacations_likes_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Shorten "Paris, France" -> "Paris" for readable X-axis labels.
  const chartData = data.map((r) => ({
    destination: r.destination.split(",")[0],
    likes: r.likes_count,
  }));

  return (
    <div className="page">
      <div className="toolbar">
        <div>
          <h1>Reports</h1>
          <p className="subtitle" style={{ margin: 0 }}>Likes per vacation destination</p>
        </div>
        <div className="spacer" />
        <button className="btn" onClick={downloadCsv} disabled={loading || data.length === 0}>
          ⬇ Download CSV
        </button>
      </div>

      {loading ? (
        <div className="center-note"><span className="spinner" /> Loading report…</div>
      ) : data.length === 0 ? (
        <div className="center-note">No data to report.</div>
      ) : (
        <div className="card">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="destination"
                angle={-40}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="likes" fill="#1e63e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
