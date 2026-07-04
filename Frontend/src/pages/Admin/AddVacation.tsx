import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as vacationsService from "../../services/vacations.service";
import { getErrorMessage } from "../../api/client";

interface FormValues {
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
  image: FileList;
}

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function AddVacation() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const today = todayISO();

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("destination", data.destination);
      form.append("description", data.description);
      form.append("start_date", data.start_date);
      form.append("end_date", data.end_date);
      form.append("price", String(data.price));
      form.append("image", data.image[0] as Blob);
      await vacationsService.createVacation(form);
      toast.success("Vacation added");
      navigate("/admin/vacations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add vacation"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Add Vacation</h1>
      <p className="subtitle">All fields are required. Dates cannot be in the past.</p>

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
            <input type="date" min={today}
              {...register("start_date", {
                required: "Start date is required",
                validate: (v) => v >= today || "Start date cannot be in the past",
              })} />
            {errors.start_date && <span className="error">{errors.start_date.message}</span>}
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date" min={today}
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
          <label>Image</label>
          <input type="file" accept="image/*"
            {...register("image", { required: "An image is required" })} />
          {errors.image && <span className="error">{errors.image.message as string}</span>}
        </div>

        <div className="admin-actions">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Vacation"}
          </button>
          <button className="btn secondary" type="button" onClick={() => navigate("/admin/vacations")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
