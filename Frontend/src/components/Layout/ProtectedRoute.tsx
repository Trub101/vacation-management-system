import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store";

interface Props {
  children: ReactNode;
  /** If set, restrict the route to a single role. */
  role?: "user" | "admin";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Send each role to its natural home page.
    return <Navigate to={user?.role === "admin" ? "/admin/vacations" : "/vacations"} replace />;
  }

  return <>{children}</>;
}
