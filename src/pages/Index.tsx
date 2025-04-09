
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

const EmailApp = () => {
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const data = await emailService.getEmails();
        setEmails(data);
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

    fetchEmails();
    
    // Set an interval to refresh emails every 30 seconds
    const refreshInterval = setInterval(fetchEmails, 30000);
    
    // Clear interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

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
      setReplyToEmail({
        id: selectedEmail.id,
        sender: {
          name: selectedEmail.sender.name,
          email: selectedEmail.sender.email,
        },
        subject: selectedEmail.subject,
      });
      setComposeOpen(true);
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      const success = await emailService.sendEmail(emailData);
      if (success) {
        // Save to sent emails in localStorage
        const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
        sentEmails.push({
          ...emailData,
          sentAt: new Date().toISOString(),
          id: `sent_${Date.now()}`
        });
        localStorage.setItem('email_sent', JSON.stringify(sentEmails));
        
        toast({
          title: "Email Sent ✅",
          description: "Your email has been sent successfully.",
        });
        setComposeOpen(false);
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
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full inline-block mb-2"></div>
              <p>Loading your emails...</p>
              <p className="text-sm text-gray-500 mt-2">
                {isOutlookConnected ? "Syncing with Outlook..." : "Loading inbox..."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <EmailList 
              emails={emails}
              selectedEmail={selectedEmailId}
              onSelectEmail={handleSelectEmail}
            />
            
            <EmailView 
              email={selectedEmail}
              onBack={handleBackToList}
              onReply={handleReply}
            />
          </>
        )}
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
