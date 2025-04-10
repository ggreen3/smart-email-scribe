
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailSidebar from "@/components/EmailSidebar";
import EmailList from "@/components/EmailList";
import { emailService } from "@/services/emailService";
import { aiWebSocketService } from "@/services/aiWebSocketService";
import { EmailPreview } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Drafts() {
  const [drafts, setDrafts] = useState<EmailPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isAIConnected, setIsAIConnected] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check AI connection status
  useEffect(() => {
    const handleConnectionStatus = (connected: boolean) => {
      setIsAIConnected(connected);
    };
    
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    
    return () => {
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, []);

  // Fetch drafts on component mount
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        toast({
          title: "Loading Drafts",
          description: "Retrieving your draft emails...",
        });
        
        const data = await emailService.getDrafts();
        setDrafts(data);
        
        toast({
          title: "Drafts Loaded",
          description: `Retrieved ${data.length} draft emails.`,
        });
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
    
    // Find the selected draft
    const selectedDraft = drafts.find(draft => draft.id === id);
    
    if (selectedDraft) {
      // Extract data from the draft
      const draftContent = {
        id: selectedDraft.id,
        subject: selectedDraft.subject,
        recipient: selectedDraft.preview.includes("To:") 
          ? selectedDraft.preview.split("To:")[1].split("-")[0].trim() 
          : "",
        content: selectedDraft.preview.includes("-") 
          ? selectedDraft.preview.split("-")[1].replace("...", "").trim() 
          : "",
        createdAt: new Date().toISOString()
      };
      
      // Navigate to compose with the draft data
      navigate("/compose", { state: { draft: draftContent } });
    } else {
      toast({
        title: "Draft Not Found",
        description: "Unable to load the selected draft.",
        variant: "destructive",
      });
    }
  };

  const handleImproveWithAI = (id: string) => {
    if (!isAIConnected) {
      toast({
        title: "AI Service Disconnected",
        description: "Cannot connect to AI service. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    // Find the selected draft
    const selectedDraft = drafts.find(draft => draft.id === id);
    
    if (selectedDraft) {
      // Navigate to compose with the draft data and AI improvement request
      navigate("/compose", { 
        state: { 
          draft: {
            id: selectedDraft.id,
            subject: selectedDraft.subject,
            recipient: selectedDraft.preview.includes("To:") 
              ? selectedDraft.preview.split("To:")[1].split("-")[0].trim() 
              : "",
            content: selectedDraft.preview.includes("-") 
              ? selectedDraft.preview.split("-")[1].replace("...", "").trim() 
              : "",
            createdAt: new Date().toISOString()
          },
          improveWithAI: true
        } 
      });
      
      toast({
        title: "AI Improvement Requested",
        description: "Opening draft with AI assistance...",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex flex-1 overflow-hidden">
        {loading ? (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p>Loading drafts...</p>
            </div>
          </div>
        ) : drafts.length > 0 ? (
          <div className="flex flex-col w-full">
            <div className="p-4 border-b border-email-border flex justify-between items-center">
              <h1 className="text-xl font-bold">Drafts</h1>
              
              {isAIConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Available
                </Badge>
              )}
            </div>
            
            <EmailList 
              emails={drafts}
              selectedEmail={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              customActions={[
                {
                  label: "Improve with AI",
                  icon: Sparkles,
                  action: handleImproveWithAI,
                  disabled: !isAIConnected
                }
              ]}
            />
          </div>
        ) : (
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-4">Drafts</h1>
            <p>Your draft emails will appear here.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start composing an email and click "Save as Draft" to see it here.
            </p>
            <Button 
              className="mt-4"
              onClick={() => navigate("/compose")}
            >
              Compose New Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
