import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/authSlice";

export default function Navbar() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const initial = user?.first_name?.charAt(0)?.toUpperCase() ?? "?";

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark" aria-hidden="true">✈</span>
        <span className="brand-word">Vacations</span>
      </NavLink>

      <nav>
        {!isAuthenticated && (
          <>
            <NavLink to="/register" className="nav-link">Register</NavLink>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            <NavLink to="/vacations" className="nav-link">Vacations</NavLink>
            <NavLink to="/ai" className="nav-link">AI Recommendation</NavLink>
            <NavLink to="/mcp" className="nav-link">MCP Chat</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <span className="nav-me">
              <span className="nav-avatar" aria-hidden="true">{initial}</span>
              {user?.first_name} {user?.last_name}
            </span>
            <button className="btn secondary small" onClick={handleLogout}>Logout</button>
          </>
        )}

        {isAuthenticated && isAdmin && (
          <>
            <NavLink to="/admin/vacations" className="nav-link">Admin Panel</NavLink>
            <NavLink to="/admin/reports" className="nav-link">Reports</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <span className="nav-me">
              <span className="nav-avatar" aria-hidden="true">{initial}</span>
              {user?.first_name} {user?.last_name}
            </span>
            <button className="btn secondary small" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
