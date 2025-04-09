
import EmailSidebar from "@/components/EmailSidebar";

export default function Settings() {
  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Email application settings will appear here.</p>
      </div>
    </div>
  );
}
