
import { useState, useEffect } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import EmailList from "@/components/EmailList";
import EmailView from "@/components/EmailView";
import ComposeEmail from "@/components/ComposeEmail";
import { OutlookConnect } from "@/components/OutlookConnect";
import { EmailLoadingState } from "@/components/EmailLoadingState";
import { RefreshButton } from "@/components/RefreshButton";
import { ComposeButton } from "@/components/ComposeButton";
import { useEmails } from "@/hooks/useEmails";
import { outlookService } from "@/services/outlookService";
import { useNavigate } from "react-router-dom";

const EmailApp = () => {
  const {
    emails,
    selectedEmailId,
    selectedEmail,
    loading,
    refreshing,
    emailLoadingProgress,
    emailLoadingError,
    setSelectedEmailId,
    handleRefresh,
    fetchEmails
  } = useEmails();

  const [composeOpen, setComposeOpen] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [forceOutlookConnect, setForceOutlookConnect] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkOutlookConnection = () => {
      console.log("Checking Outlook connection status...");
      const connected = outlookService.checkConnection();
      setIsOutlookConnected(connected);
      
      if (!connected) {
        setShowConnectDialog(true);
        console.log("Outlook not connected, showing connect dialog");
      }
    };
    
    checkOutlookConnection();
    
    const handleOutlookConnectionChanged = (event: CustomEvent) => {
      setIsOutlookConnected(event.detail);
    };
    
    window.addEventListener('outlookConnectionChanged', handleOutlookConnectionChanged as EventListener);
    
    return () => {
      window.removeEventListener('outlookConnectionChanged', handleOutlookConnectionChanged as EventListener);
    };
  }, [forceOutlookConnect]);

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

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex flex-1 overflow-hidden">
        {loading && !selectedEmailId ? (
          <EmailLoadingState 
            emailLoadingProgress={emailLoadingProgress}
            emailLoadingError={emailLoadingError}
            onRetry={handleRefresh}
          />
        ) : (
          <EmailList 
            emails={emails}
            selectedEmail={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            loading={loading}
            onRefresh={handleRefresh}
          />
        )}
        
        <EmailView 
          email={selectedEmail}
          onBack={handleBackToList}
          onReply={handleReply}
        />
      </div>
      
      <RefreshButton refreshing={refreshing} onRefresh={handleRefresh} />
      <ComposeButton />
      
      {composeOpen && (
        <ComposeEmail 
          onClose={() => setComposeOpen(false)}
          onSend={async () => {
            setComposeOpen(false);
            await fetchEmails(true);
          }}
        />
      )}
      
      <OutlookConnect
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onConnected={() => {
          setIsOutlookConnected(true);
          fetchEmails();
        }}
      />
    </div>
  );
};

export default EmailApp;
