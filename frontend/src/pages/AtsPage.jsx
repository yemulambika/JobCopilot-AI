import Navbar from "../components/Navbar";
import AtsAnalysis from "../components/AtsAnalysis";

function AtsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <AtsAnalysis />
      </div>
    </div>
  );
}

export default AtsPage;