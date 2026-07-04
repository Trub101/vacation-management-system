import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as authService from "../services/auth.service";
import { getErrorMessage } from "../api/client";
import { useAppDispatch } from "../store";
import { setCredentials } from "../store/authSlice";
import type { LoginPayload } from "../types/user.types";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>();
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginPayload) => {
    setSubmitting(true);
    try {
      const res = await authService.login(data);
      dispatch(setCredentials(res));
      toast.success(`Welcome back, ${res.user.first_name}!`);
      navigate(res.user.role === "admin" ? "/admin/vacations" : "/vacations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to browse vacations.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 4, message: "At least 4 characters" },
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button className="btn block" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>
        <p className="muted-link">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
