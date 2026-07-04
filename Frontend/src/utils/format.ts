import { format, parseISO } from "date-fns";

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type VacationStatus = "active" | "upcoming" | "ended";

export function getStatus(startISO: string, endISO: string): VacationStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  if (today < start) return "upcoming";
  if (today > end) return "ended";
  return "active";
}

export const STATUS_LABEL: Record<VacationStatus, string> = {
  active: "Active now",
  upcoming: "Not started yet",
  ended: "Ended",
};

/** SVG placeholder used when a vacation image file is missing. */
export function placeholderImage(destination: string): string {
  const label = destination.split(",")[0] ?? destination;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4c7fe0"/><stop offset="100%" stop-color="#8a5cd1"/>
    </linearGradient></defs>
    <rect width="600" height="360" fill="url(#g)"/>
    <text x="50%" y="50%" fill="#ffffff" font-family="Segoe UI, Arial" font-size="34"
      font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
