import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as authService from "../services/auth.service";
import { getErrorMessage } from "../api/client";
import { useAppDispatch } from "../store";
import { setCredentials } from "../store/authSlice";
import type { RegisterPayload } from "../types/user.types";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>();
  const [submitting, setSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<null | "ok" | "taken">(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Real-time email availability check on blur.
  const handleEmailBlur = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus(null);
      return;
    }
    try {
      const available = await authService.checkEmailAvailable(email);
      setEmailStatus(available ? "ok" : "taken");
    } catch {
      setEmailStatus(null);
    }
  };

  const onSubmit = async (data: RegisterPayload) => {
    if (emailStatus === "taken") {
      toast.error("That email is already registered");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.register(data);
      dispatch(setCredentials(res));
      toast.success(`Welcome, ${res.user.first_name}!`);
      navigate("/vacations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Join and start liking vacations.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-row">
            <div className="field">
              <label>First name</label>
              <input
                {...register("first_name", { required: "Required", maxLength: 50 })}
              />
              {errors.first_name && <span className="error">{errors.first_name.message}</span>}
            </div>
            <div className="field">
              <label>Last name</label>
              <input
                {...register("last_name", { required: "Required", maxLength: 50 })}
              />
              {errors.last_name && <span className="error">{errors.last_name.message}</span>}
            </div>
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                onBlur: (e) => handleEmailBlur(e.target.value),
              })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
            {!errors.email && emailStatus === "ok" && <span className="ok">✓ Email is available</span>}
            {!errors.email && emailStatus === "taken" && <span className="error">Email already registered</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 4 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 4, message: "At least 4 characters" },
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button className="btn block" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="muted-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
