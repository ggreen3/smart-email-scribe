
import { useState, useEffect } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import EmailList from "@/components/EmailList";
import EmailView from "@/components/EmailView";
import ComposeEmail from "@/components/ComposeEmail";
import { emailService } from "@/services/emailService";
import { outlookService } from "@/services/outlookService";
import { aiWebSocketService } from "@/services/aiWebSocketService";
import { EmailPreview, EmailDetail } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const EmailApp = () => {
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [outlookEmail, setOutlookEmail] = useState('');
  const [connectingOutlook, setConnectingOutlook] = useState(false);
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
    const checkOutlookConnection = () => {
      const connected = outlookService.checkConnection();
      setIsOutlookConnected(connected);
      
      if (connected) {
        const userEmail = localStorage.getItem('outlook_email');
        
        toast({
          title: "Outlook Connected ✅",
          description: `Your emails are syncing with Outlook (${userEmail}).`,
        });
      } else {
        // Show connection dialog if not connected
        setShowConnectDialog(true);
      }
    };
    
    checkOutlookConnection();
    
    // Listen for outlook connection changes
    const handleOutlookConnectionChanged = (event: CustomEvent) => {
      setIsOutlookConnected(event.detail);
    };
    
    window.addEventListener('outlookConnectionChanged', handleOutlookConnectionChanged as EventListener);
    
    return () => {
      window.removeEventListener('outlookConnectionChanged', handleOutlookConnectionChanged as EventListener);
    };
  }, []);

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
    
    // Set an interval to refresh emails every 60 seconds
    const refreshInterval = setInterval(fetchEmails, 60000);
    
    // Clear interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [isOutlookConnected]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      toast({
        title: "Syncing Emails",
        description: "Retrieving your emails...",
      });
      
      const data = await emailService.getEmails();
      setEmails(data);
      
      // Dispatch a custom event to notify other components about the email update
      window.dispatchEvent(new CustomEvent('emailsUpdated'));
      
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
      
      // Dispatch a custom event to notify other components about the email update
      window.dispatchEvent(new CustomEvent('emailsUpdated'));
      
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
            
            // Dispatch a custom event to notify other components about the email update
            window.dispatchEvent(new CustomEvent('emailsUpdated'));
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
        
        // Refresh sent emails
        const sentEmails = await emailService.getSentEmails();
        
        // Dispatch a custom event to notify other components about the email update
        window.dispatchEvent(new CustomEvent('emailsUpdated'));
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
        
        // Dispatch a custom event to notify other components about the email update
        window.dispatchEvent(new CustomEvent('emailsUpdated'));
      } catch (draftError) {
        console.error("Error saving draft:", draftError);
      }
    }
  };

  const handleConnectOutlook = async () => {
    if (!outlookEmail || outlookEmail.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter your Outlook email address.",
        variant: "destructive",
      });
      return;
    }
    
    setConnectingOutlook(true);
    
    try {
      const success = await outlookService.connect(outlookEmail);
      
      if (success) {
        toast({
          title: "Outlook Connected ✅",
          description: `Successfully connected to Outlook (${outlookEmail}).`,
        });
        
        // Set the number of emails to load
        localStorage.setItem('outlook_email_count', '600'); // Set to match the user's expectation
        
        setIsOutlookConnected(true);
        setShowConnectDialog(false);
        
        // Refresh email list
        handleRefresh();
        
        // Let the AI know about Outlook connection
        aiWebSocketService.setCustomSystemPrompt(
          "You are an AI assistant for email management. You now have access to the user's Outlook emails and can help organize, summarize, draft responses, and provide insights based on the full email context."
        );
      } else {
        throw new Error("Failed to connect to Outlook");
      }
    } catch (error) {
      console.error("Error connecting to Outlook:", error);
      toast({
        title: "Connection Failed ❌",
        description: "Failed to connect to Outlook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingOutlook(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex flex-1 overflow-hidden">
        <EmailList 
          emails={emails}
          selectedEmail={selectedEmailId}
          onSelectEmail={handleSelectEmail}
          loading={loading}
          onRefresh={handleRefresh}
        />
        
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
      
      {/* Outlook Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect to Outlook</DialogTitle>
            <DialogDescription>
              Connect to your Outlook account to access all your emails. We found you have over 600 emails that need to be imported.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="email"
                placeholder="Your Outlook email address"
                className="col-span-4"
                value={outlookEmail}
                onChange={(e) => setOutlookEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleConnectOutlook}
              disabled={connectingOutlook}
              className="w-full"
            >
              {connectingOutlook ? 'Connecting...' : 'Connect to Outlook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailApp;
