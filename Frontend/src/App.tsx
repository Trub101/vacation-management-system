import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import { useAppSelector } from "./store";

import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Vacations from "./pages/Vacations";
import AIRecommendation from "./pages/AIRecommendation";
import MCPChat from "./pages/MCPChat";
import AdminVacations from "./pages/Admin/AdminVacations";
import AddVacation from "./pages/Admin/AddVacation";
import EditVacation from "./pages/Admin/EditVacation";
import Reports from "./pages/Admin/Reports";

function Home() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "admin" ? "/admin/vacations" : "/vacations"} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* User-only routes */}
        <Route path="/vacations" element={<ProtectedRoute role="user"><Vacations /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute role="user"><AIRecommendation /></ProtectedRoute>} />
        <Route path="/mcp" element={<ProtectedRoute role="user"><MCPChat /></ProtectedRoute>} />

        {/* Admin-only routes */}
        <Route path="/admin/vacations" element={<ProtectedRoute role="admin"><AdminVacations /></ProtectedRoute>} />
        <Route path="/admin/vacations/add" element={<ProtectedRoute role="admin"><AddVacation /></ProtectedRoute>} />
        <Route path="/admin/vacations/edit/:id" element={<ProtectedRoute role="admin"><EditVacation /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
