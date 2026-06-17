import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TailorPage from "./pages/TailorPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import EmailPage from "./pages/EmailPage";
import AtsPage from "./pages/AtsPage";
import SkillGapPage from "./pages/SkillGapPage";
import JobTrackerPage from "./pages/JobTrackerPage";
import CareerInsightsPage from "./pages/CareerInsightsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ResumeRanking from "./pages/ResumeRanking";
import KeywordOptimizer from "./pages/KeywordOptimizer";
import JobBookmarks from "./pages/JobBookmarks";
import PersonalDashboard from "./pages/PersonalDashboard";
import ExportResume from "./pages/ExportResume";
import ResumeImprover from "./pages/ResumeImprover";
import NotificationsPage from "./pages/Notifications";
import JobCollector from "./pages/JobCollector";
import AutofillAssistant from "./pages/AutofillAssistant";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tailor"
        element={
          <ProtectedRoute>
            <TailorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cover-letter"
        element={
          <ProtectedRoute>
            <CoverLetterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emails"
        element={
          <ProtectedRoute>
            <EmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <AtsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-gap"
        element={
          <ProtectedRoute>
            <SkillGapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobTrackerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-insights"
        element={
          <ProtectedRoute>
            <CareerInsightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

<Route path="/analytics" element={<AnalyticsDashboard />} />
<Route path="/rank-resumes" element={<ResumeRanking />} />
<Route path="/optimize" element={<KeywordOptimizer />} />
<Route path="/bookmarks" element={<JobBookmarks />} />
<Route path="/dashboard" element={<PersonalDashboard />} />
<Route path="/export" element={<ExportResume />} />
<Route path="/improve" element={<ResumeImprover />} />
<Route path="/notifications" element={<NotificationsPage />} />
<Route path="/collect" element={<JobCollector />} />
<Route path="/autofill" element={<AutofillAssistant />} />
{/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;