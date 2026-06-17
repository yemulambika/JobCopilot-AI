import { useState } from "react";
import Navbar from "../components/Navbar";
import TailorSection from "../components/TailorSection";
import ResumeVersionManager from "../components/ResumeVersionManager";

function TailorPage() {
  const [activeVersionId, setActiveVersionId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tailor Section */}
          <div className="lg:col-span-2">
            <TailorSection onVersionSaved={() => {}} />
          </div>

          {/* Version History Sidebar */}
          <div className="lg:col-span-1">
            <ResumeVersionManager
              activeVersionId={activeVersionId}
              onVersionSelect={(v) => setActiveVersionId(v.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TailorPage;