import Navbar from "../components/Navbar";
import UploadSection from "../components/UploadSection";
import ResumeList from "../components/ResumeList";

function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <div className="flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <UploadSection />
          <ResumeList />
        </div>
      </div>
    </div>
  );
}

export default Home;
