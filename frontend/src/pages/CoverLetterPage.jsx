import Navbar from "../components/Navbar";
import CoverLetterSection from "../components/CoverLetterSection";

function CoverLetterPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <CoverLetterSection />
      </div>
    </div>
  );
}

export default CoverLetterPage;