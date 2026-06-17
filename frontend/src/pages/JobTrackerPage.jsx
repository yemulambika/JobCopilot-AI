import Navbar from "../components/Navbar";
import JobKanbanBoard from "../components/JobKanbanBoard";

function JobTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <JobKanbanBoard />
      </div>
    </div>
  );
}

export default JobTrackerPage;