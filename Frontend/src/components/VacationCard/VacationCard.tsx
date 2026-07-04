import { useState } from "react";
import type { Vacation } from "../../types/vacation.types";
import { imageUrl } from "../../api/client";
import {
  formatDate,
  formatPrice,
  getStatus,
  STATUS_LABEL,
  placeholderImage,
} from "../../utils/format";

interface Props {
  vacation: Vacation;
  mode: "user" | "admin";
  onToggleLike?: (vacation: Vacation) => void;
  onEdit?: (vacation: Vacation) => void;
  onDelete?: (vacation: Vacation) => void;
}

export default function VacationCard({
  vacation,
  mode,
  onToggleLike,
  onEdit,
  onDelete,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = getStatus(vacation.start_date, vacation.end_date);
  const src = imgFailed
    ? placeholderImage(vacation.destination)
    : imageUrl(vacation.image_filename);

  return (
    <article className="vcard">
      <div className="img">
        <img
          src={src}
          alt={vacation.destination}
          onError={() => setImgFailed(true)}
        />
        <span className="price-tag">{formatPrice(vacation.price)}</span>

        {mode === "user" && (
          <button
            type="button"
            className={`like-btn ${vacation.is_liked ? "liked" : ""}`}
            onClick={() => onToggleLike?.(vacation)}
            aria-label={vacation.is_liked ? "Unlike" : "Like"}
          >
            <span className="heart">{vacation.is_liked ? "♥" : "♡"}</span>
            {vacation.likes_count}
          </button>
        )}
      </div>

      <div className="body">
        <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
        <h3>{vacation.destination}</h3>
        <div className="dates">
          {formatDate(vacation.start_date)} → {formatDate(vacation.end_date)}
        </div>
        <p className="desc">{vacation.description}</p>

        {mode === "admin" && (
          <div className="admin-actions">
            <button
              className="btn secondary small"
              onClick={() => onEdit?.(vacation)}
            >
              Edit
            </button>
            <button
              className="btn danger small"
              onClick={() => onDelete?.(vacation)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
