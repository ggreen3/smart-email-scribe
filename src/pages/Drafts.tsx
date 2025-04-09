
import { useState, useEffect } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import EmailList from "@/components/EmailList";
import { emailService } from "@/services/emailService";
import { EmailPreview } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export default function Drafts() {
  const [drafts, setDrafts] = useState<EmailPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch drafts on component mount
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const data = await emailService.getDrafts();
        setDrafts(data);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast({
          title: "Error ❌",
          description: "Failed to load drafts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    // In a full implementation, this would navigate to compose with draft loaded
    toast({
      title: "Opening Draft ✏️",
      description: "This would open the draft for editing in a real implementation.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex flex-1 overflow-hidden">
        {loading ? (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full inline-block mb-2"></div>
              <p>Loading drafts...</p>
            </div>
          </div>
        ) : drafts.length > 0 ? (
          <EmailList 
            emails={drafts}
            selectedEmail={selectedEmailId}
            onSelectEmail={handleSelectEmail}
          />
        ) : (
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-4">Drafts</h1>
            <p>Your draft emails will appear here.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start composing an email and click "Save as Draft" to see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
