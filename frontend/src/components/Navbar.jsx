import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive(path) ? "bg-cyan-400/10 text-cyan-400" : "text-slate-300 hover:text-white"
    }`;

  return (
    <div className="w-full border-b border-slate-700 bg-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl font-bold text-cyan-400">AI Resume Matcher</h1>
          </Link>
          {user && (
            <nav className="flex items-center gap-4">
              <Link to="/" className={linkClass("/")}>📄 Upload</Link>
              <Link to="/tailor" className={linkClass("/tailor")}>✂️ Tailor</Link>
              <Link to="/cover-letter" className={linkClass("/cover-letter")}>✉️ Cover Letter</Link>
              <Link to="/emails" className={linkClass("/emails")}>📧 Emails</Link>
              <Link to="/ats" className={linkClass("/ats")}>🎯 ATS</Link>
              <Link to="/skill-gap" className={linkClass("/skill-gap")}>🔬 Skill Gap</Link>
              <Link to="/jobs" className={linkClass("/jobs")}>📋 Jobs</Link>
              <Link to="/career-insights" className={linkClass("/career-insights")}>🎯 Insights</Link>
              <Link to="/admin" className={linkClass("/admin")}>🛠️ Admin</Link>
              <Link to="/analytics" className={linkClass("/analytics")}>📊 Analytics</Link>
              <Link to="/rank-resumes" className={linkClass("/rank-resumes")}>📄 Ranking</Link>
              <Link to="/optimize" className={linkClass("/optimize")}>🧠 Optimizer</Link>
              <Link to="/bookmarks" className={linkClass("/bookmarks")}>📑 Bookmarks</Link>
              <Link to="/dashboard" className={linkClass("/dashboard")}>📊 Dashboard</Link>
              <Link to="/export" className={linkClass("/export")}>📤 Export</Link>
              <Link to="/knowledge" className={linkClass("/knowledge")}>📚 Knowledge</Link>
              <Link to="/match" className={linkClass("/match")}>📈 Match</Link>
              <Link to="/improve" className={linkClass("/improve")}>🆙 Improve</Link>
              <Link to="/feed" className={linkClass("/feed")}>📡 Feed</Link>
              <Link to="/notifications" className={linkClass("/notifications")}>🔔 Notifications</Link>
              <Link to="/collect" className={linkClass("/collect")}>📭 Collect</Link>
              <Link to="/autofill" className={linkClass("/autofill")}>✍️ Autofill</Link>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}