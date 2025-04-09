
import EmailSidebar from "@/components/EmailSidebar";

export default function Spam() {
  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Spam</h1>
        <p>Emails marked as spam will appear here.</p>
      </div>
    </div>
  );
}
