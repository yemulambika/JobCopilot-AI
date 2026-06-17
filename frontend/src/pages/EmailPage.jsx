import Navbar from "../components/Navbar";
import EmailSection from "../components/EmailSection";

function EmailPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="px-4 py-10">
        <EmailSection />
      </div>
    </div>
  );
}

export default EmailPage;