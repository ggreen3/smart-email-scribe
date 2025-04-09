
import { useState, useEffect } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import EmailList from "@/components/EmailList";
import EmailView from "@/components/EmailView";
import ComposeEmail from "@/components/ComposeEmail";
import { emailService } from "@/services/emailService";
import { outlookService } from "@/services/outlookService";
import { EmailPreview, EmailDetail } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const EmailApp = () => {
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<{
    id: string;
    sender: {
      name: string;
      email: string;
    };
    subject: string;
  } | undefined>(undefined);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if Outlook is connected
  useEffect(() => {
    const connected = outlookService.checkConnection();
    setIsOutlookConnected(connected);
    
    if (connected) {
      const userEmail = localStorage.getItem('outlook_email');
      
      toast({
        title: "Outlook Connected ✅",
        description: `Your emails are syncing with Outlook (${userEmail}).`,
      });
    }
  }, []);

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
    
    // Set an interval to refresh emails every 60 seconds
    const refreshInterval = setInterval(fetchEmails, 60000);
    
    // Clear interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      toast({
        title: "Syncing Emails",
        description: "Retrieving your emails...",
      });
      
      const data = await emailService.getEmails();
      setEmails(data);
      
      toast({
        title: "Emails Synced",
        description: `Retrieved ${data.length} emails.`,
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error ❌",
        description: "Failed to load emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      toast({
        title: "Refreshing Emails",
        description: "Fetching your latest emails...",
      });
      
      const data = await emailService.getEmails();
      setEmails(data);
      
      toast({
        title: "Emails Refreshed",
        description: `Retrieved ${data.length} emails.`,
      });
    } catch (error) {
      console.error("Error refreshing emails:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch selected email details
  useEffect(() => {
    if (selectedEmailId) {
      const fetchEmailDetails = async () => {
        try {
          const data = await emailService.getEmailById(selectedEmailId);
          setSelectedEmail(data);
          
          // Update email in the list to mark as read
          if (data) {
            setEmails(prev => 
              prev.map(email => 
                email.id === selectedEmailId 
                  ? { ...email, read: true } 
                  : email
              )
            );
          }
        } catch (error) {
          console.error("Error fetching email details:", error);
          toast({
            title: "Error ❌",
            description: "Failed to load email details. Please try again.",
            variant: "destructive",
          });
        }
      };

      fetchEmailDetails();
    } else {
      setSelectedEmail(null);
    }
  }, [selectedEmailId]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
  };

  const handleBackToList = () => {
    setSelectedEmailId(null);
  };

  const handleComposeNew = () => {
    navigate('/compose');
  };

  const handleReply = (emailId: string) => {
    if (selectedEmail) {
      navigate('/compose', {
        state: {
          replyTo: {
            id: selectedEmail.id,
            subject: selectedEmail.subject,
            sender: {
              name: selectedEmail.sender.name,
              email: selectedEmail.sender.email,
            },
            date: selectedEmail.date,
            body: selectedEmail.body || ""
          }
        }
      });
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      toast({
        title: "Sending Email",
        description: "Your email is being sent...",
      });
      
      const success = await emailService.sendEmail(emailData);
      
      if (success) {
        toast({
          title: "Email Sent ✅",
          description: "Your email has been sent successfully.",
        });
        setComposeOpen(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Send Failed ❌",
        description: "Failed to send email. Saved as draft instead.",
        variant: "destructive",
      });
      
      // Save as draft if sending fails
      try {
        await emailService.saveDraft({
          ...emailData,
          createdAt: new Date().toISOString()
        });
      } catch (draftError) {
        console.error("Error saving draft:", draftError);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col w-80">
          <div className="p-2 flex justify-end border-b border-email-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <EmailList 
            emails={emails}
            selectedEmail={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            loading={loading}
          />
        </div>
        
        <EmailView 
          email={selectedEmail}
          onBack={handleBackToList}
          onReply={handleReply}
        />
      </div>
      
      {composeOpen && (
        <ComposeEmail 
          replyToEmail={replyToEmail}
          onClose={() => setComposeOpen(false)}
          onSend={handleSendEmail}
        />
      )}
      
      {/* Compose button (mobile only) */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <button
          onClick={handleComposeNew}
          className="bg-email-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10"></path>
            <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmailApp;
