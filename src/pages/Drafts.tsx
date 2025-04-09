
import EmailSidebar from "@/components/EmailSidebar";

export default function Drafts() {
  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Drafts</h1>
        <p>Your draft emails will appear here.</p>
      </div>
    </div>
  );
}
