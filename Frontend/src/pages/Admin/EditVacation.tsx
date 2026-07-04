import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as vacationsService from "../../services/vacations.service";
import { getErrorMessage, imageUrl } from "../../api/client";

interface FormValues {
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
  image?: FileList;
}

export default function EditVacation() {
  const { id } = useParams();
  const vacationId = Number(id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<FormValues>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const v = await vacationsService.fetchVacation(vacationId);
        reset({
          destination: v.destination,
          description: v.description,
          start_date: v.start_date,
          end_date: v.end_date,
          price: v.price,
        });
        setCurrentImage(v.image_filename);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not load vacation"));
        navigate("/admin/vacations");
      } finally {
        setLoading(false);
      }
    })();
  }, [vacationId, reset, navigate]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("destination", data.destination);
      form.append("description", data.description);
      form.append("start_date", data.start_date);
      form.append("end_date", data.end_date);
      form.append("price", String(data.price));
      if (data.image && data.image.length > 0) {
        form.append("image", data.image[0] as Blob);
      }
      await vacationsService.updateVacation(vacationId, form);
      toast.success("Vacation updated");
      navigate("/admin/vacations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update vacation"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="center-note"><span className="spinner" /> Loading…</div></div>;
  }

  return (
    <div className="page">
      <h1>Edit Vacation</h1>
      <p className="subtitle">Past dates are allowed. Changing the image is optional.</p>

      <form className="card" style={{ maxWidth: 640 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label>Destination</label>
          <input {...register("destination", { required: "Destination is required", maxLength: 100 })} />
          {errors.destination && <span className="error">{errors.destination.message}</span>}
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows={4} {...register("description", { required: "Description is required" })} />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        <div className="form-row">
          <div className="field">
            <label>Start date</label>
            <input type="date" {...register("start_date", { required: "Start date is required" })} />
            {errors.start_date && <span className="error">{errors.start_date.message}</span>}
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date"
              {...register("end_date", {
                required: "End date is required",
                validate: (v) => v >= getValues("start_date") || "End date cannot be before start date",
              })} />
            {errors.end_date && <span className="error">{errors.end_date.message}</span>}
          </div>
        </div>

        <div className="field">
          <label>Price (USD)</label>
          <input type="number" step="0.01" min={0} max={10000}
            {...register("price", {
              required: "Price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price must be at least 0" },
              max: { value: 10000, message: "Price cannot exceed 10,000" },
            })} />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>

        <div className="field">
          <label>Current image</label>
          {currentImage && (
            <img
              src={imageUrl(currentImage)}
              alt="current"
              style={{ width: 180, height: 110, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
              onError={(e) => { (e.currentTarget.style.display = "none"); }}
            />
          )}
          <input type="file" accept="image/*" {...register("image")} />
          <span className="hint">Leave empty to keep the current image.</span>
        </div>

        <div className="admin-actions">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </button>
          <button className="btn secondary" type="button" onClick={() => navigate("/admin/vacations")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
