import Navbar from "../components/Navbar";
import { useAdminStats } from "../hooks/useAdminStats";
import Loader from "../components/Loader";

function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader />
          <p className="ml-4 text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="rounded-xl bg-red-500/10 p-6 text-center text-red-400">
            Failed to load dashboard. {error?.response?.data?.error || "Unknown error."}
          </div>
        </div>
      </div>
    );
  }

  const { users, generations, topUsers, system, errorLogs } = data || {};

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">🛠️ Admin Dashboard</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Monitoring platform usage, API calls, and system health.
          </p>
        </div>

        {/* ── Stat Cards ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={users?.total} color="cyan" icon="👥" />
          <StatCard label="Users (7d)" value={users?.last7Days} color="emerald" icon="📈" />
          <StatCard label="Daily Active" value={users?.dailyActiveUsers} color="violet" icon="⚡" />
          <StatCard label="Total Generations" value={generations?.total} color="amber" icon="🤖" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Resumes Uploaded" value={generations?.resumesUploaded} color="blue" icon="📄" />
          <StatCard label="Tailored Resumes" value={generations?.tailoredResumes} color="green" icon="✂️" />
          <StatCard label="Cover Letters" value={generations?.coverLetters} color="pink" icon="✉️" />
          <StatCard label="Email Generations" value={generations?.emailGenerations} color="orange" icon="📧" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Resume Versions" value={generations?.resumeVersions} color="purple" icon="📋" />
          <StatCard label="Job Applications" value={generations?.jobApplications} color="teal" icon="💼" />
          <StatCard label="Users (30d)" value={users?.last30Days} color="slate" icon="📊" />
        </div>

        {/* ── System Health ───────────────────────── */}
        <section className="rounded-2xl bg-slate-800 border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">💻 System Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <HealthBadge label="CPU Usage" value={`${system?.cpuUsage}%`} color={system?.cpuUsage > 80 ? "red" : system?.cpuUsage > 50 ? "amber" : "green"} />
            <HealthBadge label="Free Memory" value={`${system?.freeMemory} MB`} color="blue" />
            <HealthBadge label="Total Memory" value={`${system?.totalMemory} MB`} color="slate" />
            <HealthBadge label="Uptime" value={`${system?.uptime}h`} color="green" />
            <HealthBadge label="Node" value={system?.nodeVersion} color="cyan" />
          </div>
        </section>

        {/* ── Generations Over Time ───────────────── */}
        <section className="rounded-2xl bg-slate-800 border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 Activity Over Last 7 Days</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityChart label="Tailored Resumes" data={generations?.tailoredByDay} color="cyan" />
            <ActivityChart label="Cover Letters" data={generations?.coverLettersByDay} color="pink" />
            <ActivityChart label="Emails" data={generations?.emailsByDay} color="orange" />
            <ActivityChart label="Job Applications" data={generations?.jobsByDay} color="emerald" />
          </div>
        </section>

        {/* ── Top Users Table ─────────────────────── */}
        <section className="rounded-2xl bg-slate-800 border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">🏆 Top Users by Activity</h3>
          {topUsers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Resumes</th>
                    <th className="pb-2 pr-4">Tailored</th>
                    <th className="pb-2 pr-4">Cover L.</th>
                    <th className="pb-2 pr-4">Emails</th>
                    <th className="pb-2 pr-4">Jobs</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u, i) => (
                    <tr key={u._id || i} className="border-b border-slate-700/50">
                      <td className="py-2 pr-4">
                        <span className="font-medium text-white">{u.name}</span>
                        <br />
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-300">{u.resumesCount}</td>
                      <td className="py-2 pr-4 text-slate-300">{u.tailoredResumesCount}</td>
                      <td className="py-2 pr-4 text-slate-300">{u.coverLettersCount}</td>
                      <td className="py-2 pr-4 text-slate-300">{u.emailsCount}</td>
                      <td className="py-2 pr-4 text-slate-300">{u.jobApplicationsCount}</td>
                      <td className="py-2 font-bold text-white">{u.totalActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No user activity data yet.</p>
          )}
        </section>

        {/* ── Error Logs ──────────────────────────── */}
        <section className="rounded-2xl bg-slate-800 border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📋 System Logs</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errorLogs?.map((log, i) => (
              <div key={i} className={`p-2 rounded text-xs ${
                log.level === "error" ? "bg-red-900/20 text-red-400" :
                log.level === "warn"  ? "bg-amber-900/20 text-amber-400" :
                "bg-slate-700/30 text-slate-400"
              }`}>
                <span className="text-slate-500 mr-2">{log.timestamp?.slice(0, 19)}</span>
                <span className="font-medium">[{log.level}]</span> {log.message}
              </div>
            ))}
            {(!errorLogs || errorLogs.length === 0) && (
              <p className="text-slate-500 text-sm">No logs available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── stat card component ──────────────────────────────────── */
function StatCard({ label, value, color = "cyan", icon = "📊" }) {
  const colorMap = {
    cyan: { bg: "bg-cyan-900/20", border: "border-cyan-800", text: "text-cyan-400" },
    emerald: { bg: "bg-emerald-900/20", border: "border-emerald-800", text: "text-emerald-400" },
    violet: { bg: "bg-violet-900/20", border: "border-violet-800", text: "text-violet-400" },
    amber: { bg: "bg-amber-900/20", border: "border-amber-800", text: "text-amber-400" },
    blue: { bg: "bg-blue-900/20", border: "border-blue-800", text: "text-blue-400" },
    green: { bg: "bg-green-900/20", border: "border-green-800", text: "text-green-400" },
    pink: { bg: "bg-pink-900/20", border: "border-pink-800", text: "text-pink-400" },
    orange: { bg: "bg-orange-900/20", border: "border-orange-800", text: "text-orange-400" },
    purple: { bg: "bg-purple-900/20", border: "border-purple-800", text: "text-purple-400" },
    teal: { bg: "bg-teal-900/20", border: "border-teal-800", text: "text-teal-400" },
    slate: { bg: "bg-slate-700/20", border: "border-slate-600", text: "text-slate-400" },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${c.text}`}>{value ?? "—"}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

/* ── health badge ──────────────────────────────────────────── */
function HealthBadge({ label, value, color }) {
  const colorMap = {
    red: "text-red-400 border-red-700",
    amber: "text-amber-400 border-amber-700",
    green: "text-green-400 border-green-700",
    blue: "text-blue-400 border-blue-700",
    slate: "text-slate-400 border-slate-600",
    cyan: "text-cyan-400 border-cyan-700",
  };
  return (
    <div className={`rounded-lg border p-3 text-center ${colorMap[color] || colorMap.slate}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  );
}

/* ── simple bar chart component ─────────────────────────────── */
function ActivityChart({ label, data = [], color = "cyan" }) {
  const colorMap = {
    cyan: "bg-cyan-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
  };
  const barColor = colorMap[color] || colorMap.cyan;

  // Calculate max for bar width
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return (
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">{label}</div>
        <div className="rounded-lg bg-slate-700/30 p-4 text-center text-xs text-slate-500">
          No data this week
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-slate-400 mb-2 font-semibold">{label}</div>
      <div className="rounded-lg bg-slate-700/30 p-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
            <span className="text-xs text-slate-400 w-16 shrink-0">{d._id}</span>
            <div className="flex-1 h-4 rounded-full bg-slate-900 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                style={{ width: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboardPage;