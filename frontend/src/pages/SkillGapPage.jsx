import Navbar from "../components/Navbar";
import SkillGapAnalysis from "../components/SkillGapAnalysis";

function SkillGapPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <SkillGapAnalysis />
      </div>
    </div>
  );
}

export default SkillGapPage;