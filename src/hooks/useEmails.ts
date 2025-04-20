
import { useState, useEffect } from "react";
import { EmailPreview, EmailDetail } from "@/types/email";
import { emailService } from "@/services/emailService";
import { outlookService } from "@/services/outlookService";
import { useToast } from "@/hooks/use-toast";

export function useEmails() {
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emailLoadingProgress, setEmailLoadingProgress] = useState<string | null>(null);
  const [emailLoadingError, setEmailLoadingError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmails = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setEmailLoadingError(null);
      
      if (!silent) {
        setEmailLoadingProgress("Starting to fetch emails...");
        toast({
          title: "Syncing Emails",
          description: "Retrieving your emails...",
        });
      }
      
      const timeoutId = setTimeout(() => {
        setEmailLoadingProgress("Taking longer than expected... please wait");
      }, 5000);
      
      setEmailLoadingProgress("Connecting to Outlook service...");
      const data = await emailService.getEmails();
      clearTimeout(timeoutId);
      
      if (data && data.length > 0) {
        const outlookEmails = data.filter(email => email.isOutlookEmail === true);
        
        if (outlookEmails.length > 0) {
          console.log(`Using ${outlookEmails.length} Outlook emails, ignoring mock emails`);
          setEmails(outlookEmails);
        } else {
          console.log(`Using all ${data.length} emails (no Outlook emails detected)`);
          setEmails(data);
        }
        
        setEmailLoadingProgress(null);
        window.dispatchEvent(new CustomEvent('emailsUpdated'));
        
        if (!silent) {
          toast({
            title: "Emails Synced",
            description: `Retrieved ${outlookEmails.length > 0 ? outlookEmails.length : data.length} emails.`,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      setEmailLoadingError(`Failed to load emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Error ❌",
        description: "Failed to load emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    fetchEmails();
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    if (selectedEmailId) {
      const fetchEmailDetails = async () => {
        try {
          const data = await emailService.getEmailById(selectedEmailId);
          setSelectedEmail(data);
          
          if (data) {
            setEmails(prev => 
              prev.map(email => 
                email.id === selectedEmailId 
                  ? { ...email, read: true } 
                  : email
              )
            );
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

  return {
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
  };
}
