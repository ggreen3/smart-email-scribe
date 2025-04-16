
import { EmailPreview, EmailDetail } from "@/types/email";
import { outlookService } from "./outlookService";
import { aiWebSocketService } from "./aiWebSocketService";

// Mock email data
const mockEmails: EmailDetail[] = [
  {
    id: "1",
    subject: "Weekly Project Update",
    sender: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    preview: "Here's the latest update on our project progress. We've completed the initial phase...",
    time: "10:30 AM",
    date: "Today",
    read: false,
    isStarred: true,
    hasAttachments: true,
    labels: ["Work", "Important"],
    body: `Hi Team,

Here's the latest update on our project progress. We've completed the initial phase and are moving into the development stage. I've attached the current timeline and milestone document for your review.

Some key points to note:
- Backend API development is ahead of schedule
- We need to discuss UX improvements in tomorrow's meeting
- Client demo is scheduled for next Friday

Please review the attached documents and let me know if you have any questions or concerns.

Looking forward to our meeting tomorrow.

Best regards,
Alex`,
    attachments: [
      { name: "Project_Timeline_Q2.xlsx", size: "2.3 MB", type: "xlsx" },
      { name: "Milestone_Report.pdf", size: "1.8 MB", type: "pdf" },
    ],
  },
  {
    id: "2",
    subject: "Meeting Invitation: Quarterly Planning",
    sender: {
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    preview: "You're invited to our quarterly planning session on Thursday, June 15th at 2:00 PM...",
    time: "Yesterday",
    date: "Apr 12",
    read: true,
    isStarred: false,
    hasAttachments: false,
    labels: ["Meeting"],
    body: `Dear Team,

You're invited to our quarterly planning session on Thursday, June 15th at 2:00 PM in the Main Conference Room.

Agenda:
1. Review Q2 performance
2. Set goals for Q3
3. Budget allocation discussion
4. Team building activities planning

Please come prepared with your department's performance metrics and proposed goals for the next quarter.

Let me know if you have any items you'd like to add to the agenda.

Best regards,
Sarah Williams
Project Manager`,
  },
  {
    id: "3",
    subject: "Important: Security Update Required",
    sender: {
      name: "IT Department",
      email: "it.support@example.com",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    preview: "Please update your security credentials by the end of this week. This is required for...",
    time: "Apr 10",
    date: "Apr 10",
    read: true,
    isStarred: false,
    hasAttachments: true,
    labels: ["IT", "Urgent"],
    body: `Dear User,

This is a reminder that you need to update your security credentials by the end of this week. This is required for our annual security compliance audit.

Steps to update your credentials:
1. Log in to the employee portal
2. Navigate to 'Security Settings'
3. Update your password
4. Set up multi-factor authentication if you haven't already

I've attached a guide with screenshots for your reference.

If you need assistance, please contact the IT helpdesk at ext. 4567.

Thank you for your cooperation.

IT Department`,
    attachments: [
      { name: "Security_Update_Guide.pdf", size: "3.1 MB", type: "pdf" },
    ],
  },
  {
    id: "4",
    subject: "Client Feedback on Latest Deliverable",
    sender: {
      name: "Michael Chen",
      email: "michael.chen@clientcompany.com",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    preview: "Thank you for the latest deliverable. We've reviewed it and have some feedback to share...",
    time: "Apr 8",
    date: "Apr 8",
    read: false,
    isStarred: true,
    hasAttachments: false,
    labels: ["Client", "Feedback"],
    body: `Hello,

Thank you for the latest deliverable. We've reviewed it with our stakeholders and have some feedback to share.

Overall, we're impressed with the quality of work. The design is clean and intuitive, and the functionality meets most of our requirements. However, there are a few areas we'd like to see improved:

1. The loading time on the dashboard page is longer than expected
2. Some of the charts are not displaying correctly on mobile devices
3. We'd like to add an export to PDF feature for reports

Can we schedule a call this week to discuss these points? I'm available Wednesday or Thursday afternoon.

Best regards,
Michael Chen
Product Director
Client Company`,
  },
  {
    id: "5",
    subject: "New Training Resources Available",
    sender: {
      name: "Learning & Development",
      email: "learning@example.com",
      avatar: "https://i.pravatar.cc/150?img=15",
    },
    preview: "We've added new training resources to the company portal. These include courses on...",
    time: "Apr 5",
    date: "Apr 5",
    read: true,
    isStarred: false,
    hasAttachments: false,
    labels: ["Training"],
    body: `Hi everyone,

We've added new training resources to the company portal. These include courses on:

- Advanced Excel techniques
- Project management best practices
- Effective communication skills
- Introduction to AI and machine learning

All employees are encouraged to complete at least one course this quarter as part of our continuous learning initiative.

You can access these resources by logging into the Employee Portal and selecting the 'Learning' tab.

Happy learning!

Learning & Development Team`,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const emailService = {
  // Check if we should use Outlook or mock data
  useOutlook: async (): Promise<boolean> => {
    const connected = outlookService.checkConnection();
    console.log("Checking Outlook connection:", connected);
    return connected;
  },
  
  // Get all emails
  getEmails: async (): Promise<EmailPreview[]> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          // Show notification that emails are being retrieved
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Syncing with Outlook",
            description: "Retrieving your emails from Outlook...",
          });
          
          console.log("Getting emails from Outlook...");
          
          // Implement more reliable batched retrieval with multiple fallbacks
          const fetchWithRetry = async (attempt = 1, maxAttempts = 3) => {
            try {
              // Set a timeout for the email retrieval to prevent hanging
              const timeoutPromise = new Promise<EmailPreview[]>((_, reject) => {
                setTimeout(() => reject(new Error("Email retrieval timed out after 30 seconds")), 30000);
              });
              
              // Get emails in batches with more reliable error handling
              const getBatchedEmails = async () => {
                console.log("Using enhanced batched email retrieval from Outlook");
                
                // First try to get count before full retrieval
                const emailCount = parseInt(localStorage.getItem('outlook_email_count') || '600');
                console.log(`Expected email count: ${emailCount}`);
                
                // Adjust batch size based on expected email count - smaller batches for more reliability
                const batchSize = emailCount > 300 ? 75 : 150;
                let allEmails: EmailPreview[] = [];
                
                // Get cached emails first as a fallback
                let cachedEmails: EmailPreview[] = [];
                try {
                  cachedEmails = JSON.parse(localStorage.getItem('cached_outlook_emails') || '[]');
                  console.log(`Found ${cachedEmails.length} cached emails that will be used as fallback`);
                } catch (e) {
                  console.error("Error parsing cached emails:", e);
                }
                
                // Get emails in smaller batches with progressive timeouts
                for (let offset = 0; offset < emailCount; offset += batchSize) {
                  try {
                    console.log(`Getting batch ${offset}-${offset + batchSize} of ${emailCount} emails`);
                    const batchEmails = await outlookService.getEmailsBatch(offset, batchSize);
                    
                    if (batchEmails && batchEmails.length > 0) {
                      allEmails = [...allEmails, ...batchEmails];
                      console.log(`Retrieved ${allEmails.length} of ${emailCount} emails so far`);
                      
                      // Save partial results to cache in case of later failure
                      if (allEmails.length > 0 && allEmails.length % 150 === 0) {
                        try {
                          localStorage.setItem('cached_outlook_emails', JSON.stringify(allEmails));
                          console.log(`Cached ${allEmails.length} emails as failsafe`);
                        } catch (cacheError) {
                          console.error("Error caching partial emails:", cacheError);
                        }
                      }
                    } else {
                      console.log("Received empty batch, likely reached the end of available emails");
                      break;
                    }
                    
                    // If we have a reasonable number of emails, we can stop to prevent overloading
                    if (allEmails.length >= 200 && allEmails.length >= emailCount * 0.75) {
                      console.log("Retrieved sufficient emails, stopping batch retrieval");
                      break;
                    }
                  } catch (batchError) {
                    console.error(`Error getting batch ${offset}-${offset + batchSize}:`, batchError);
                    
                    // If we have at least some emails, continue with what we have
                    if (allEmails.length > 0) {
                      console.log(`Continuing with ${allEmails.length} emails despite batch error`);
                      break;
                    } else if (cachedEmails.length > 0) {
                      console.log("Using cached emails due to batch retrieval failure");
                      return cachedEmails;
                    }
                    
                    // Otherwise, propagate the error to try a full fallback
                    throw batchError;
                  }
                }
                
                // Cache the complete result
                if (allEmails.length > 0) {
                  try {
                    localStorage.setItem('cached_outlook_emails', JSON.stringify(allEmails));
                    console.log(`Cached all ${allEmails.length} emails successfully`);
                  } catch (cacheError) {
                    console.error("Error caching complete emails:", cacheError);
                  }
                }
                
                return allEmails;
              };
              
              // Race between email retrieval and timeout
              const outlookEmails = await Promise.race([getBatchedEmails(), timeoutPromise]);
              
              if (outlookEmails.length === 0 && cachedEmails.length > 0) {
                console.log("Retrieved empty result, using cached emails");
                return cachedEmails;
              }
              
              console.log("Successfully retrieved emails from Outlook:", outlookEmails.length);
              return outlookEmails;
            } catch (error) {
              console.error(`Outlook connection error (attempt ${attempt}/${maxAttempts}):`, error);
              
              // Try to get cached Outlook emails first
              try {
                const cachedEmails = JSON.parse(localStorage.getItem('cached_outlook_emails') || '[]');
                if (cachedEmails.length > 0) {
                  console.log(`Using ${cachedEmails.length} cached Outlook emails due to retrieval error`);
                  
                  // Show cached notification
                  const { toast } = await import("@/hooks/use-toast");
                  toast({
                    title: "Using Cached Emails",
                    description: `Using ${cachedEmails.length} previously cached emails while reconnecting to Outlook.`,
                    variant: "default",
                  });
                  
                  return cachedEmails;
                }
              } catch (cacheError) {
                console.error("Error getting cached emails:", cacheError);
              }
              
              // If we have retries left, try again with backoff
              if (attempt < maxAttempts) {
                const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
                console.log(`Retrying in ${backoffMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
                return fetchWithRetry(attempt + 1, maxAttempts);
              }
              
              // If all retries fail, throw the error to fall back to mock data
              throw error;
            }
          };
          
          const outlookEmails = await fetchWithRetry();
          
          console.log("Received emails from Outlook:", outlookEmails.length);
          
          // Show notification that emails have been retrieved
          toast({
            title: "Sync Complete",
            description: `Retrieved ${outlookEmails.length} emails from Outlook.`,
          });
          
          // Update global email counter for the UI
          window.dispatchEvent(new CustomEvent('emailsUpdated'));
          
          return outlookEmails;
        } catch (error) {
          console.error("All Outlook connection attempts failed:", error);
          
          // Show error notification
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Sync Failed",
            description: "Failed to retrieve emails from Outlook. Using cached data instead.",
            variant: "destructive",
          });
          
          // Try to get cached Outlook emails one more time
          try {
            const cachedEmails = JSON.parse(localStorage.getItem('cached_outlook_emails') || '[]');
            if (cachedEmails.length > 0) {
              console.log(`Using ${cachedEmails.length} cached Outlook emails as final fallback`);
              return cachedEmails;
            }
          } catch (cacheError) {
            console.error("Error getting cached emails:", cacheError);
          }
          
          // Fall back to mock data if Outlook fails and no cache
        }
      }
      
      // Use mock data if not using Outlook or if Outlook fails
      await delay(800);
      return mockEmails.map(email => ({
        id: email.id,
        subject: email.subject,
        sender: email.sender,
        preview: email.preview,
        time: email.time,
        date: email.date,
        read: email.read,
        isStarred: email.isStarred,
        hasAttachments: email.hasAttachments,
        labels: email.labels,
      }));
    } catch (error) {
      console.error("Fatal error in getEmails:", error);
      
      // Show error notification
      try {
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Error Retrieving Emails",
          description: "There was a problem retrieving your emails. Please try again later.",
          variant: "destructive",
        });
      } catch (e) {
        console.error("Failed to show toast:", e);
      }
      
      // Return empty array as fallback
      return [];
    }
  },
  
  // Get a single email by ID
  getEmailById: async (id: string): Promise<EmailDetail | null> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          console.log("Getting email by ID from Outlook:", id);
          // Check if ID starts with 'o' to identify Outlook emails
          const email = await outlookService.getEmailById(id);
          console.log("Received email from Outlook:", email?.subject);
          return email;
        } catch (error) {
          console.error("Outlook connection error:", error);
          // Fall back to mock data if Outlook fails
        }
      }
      
      // Use mock data if not using Outlook or if Outlook fails
      await delay(500);
      const email = mockEmails.find(email => email.id === id);
      
      if (email) {
        // Mark as read
        email.read = true;
        return { ...email };
      }
      
      return null;
    } catch (error) {
      console.error("Error in getEmailById:", error);
      return null;
    }
  },
  
  // Send a new email
  sendEmail: async (emailData: any): Promise<boolean> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          // Show notification that email is being sent
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Sending Email",
            description: "Your email is being sent via Outlook...",
          });
          
          console.log("Sending email via Outlook:", emailData);
          const success = await outlookService.sendEmail(emailData);
          
          if (success) {
            // Show success notification
            toast({
              title: "Email Sent",
              description: `Your email to ${emailData.recipient} has been sent.`,
            });
            
            // Save to sent emails in localStorage for offline access
            try {
              const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
              sentEmails.push({
                ...emailData,
                sentAt: new Date().toISOString(),
                id: `sent_${Date.now()}`
              });
              localStorage.setItem('email_sent', JSON.stringify(sentEmails));
              
              // Update counts
              window.dispatchEvent(new CustomEvent('emailsUpdated'));
            } catch (error) {
              console.error('Error saving sent email to localStorage:', error);
            }
          }
          
          return success;
        } catch (error) {
          console.error("Outlook error sending email:", error);
          
          // Show error notification
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Send Failed",
            description: "Failed to send email via Outlook. Saved as draft instead.",
            variant: "destructive",
          });
          
          // Save as draft if Outlook fails
          await emailService.saveDraft(emailData);
          return false;
        }
      }
      
      // Use mock implementation if not using Outlook or if Outlook fails
      await delay(1000);
      console.log('Email sent (mock):', emailData);
      
      // Update the sent emails count in localStorage
      try {
        const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
        sentEmails.push({
          ...emailData,
          sentAt: new Date().toISOString(),
          id: `sent_${Date.now()}`
        });
        localStorage.setItem('email_sent', JSON.stringify(sentEmails));
        
        // Update counts
        window.dispatchEvent(new CustomEvent('emailsUpdated'));
      } catch (error) {
        console.error('Error saving sent email to localStorage:', error);
      }
      
      return true;
    } catch (error) {
      console.error("Error in sendEmail:", error);
      return false;
    }
  },
  
  // Mark email as read
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      // If using Outlook and ID starts with 'o', use Outlook service
      if (await emailService.useOutlook() && id.startsWith('o')) {
        try {
          return await outlookService.markAsRead(id);
        } catch (error) {
          console.error("Outlook error marking as read:", error);
        }
      }
      
      // Use mock data as fallback
      await delay(300);
      const email = mockEmails.find(email => email.id === id);
      
      if (email) {
        email.read = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return false;
    }
  },
  
  // Star/unstar an email
  toggleStar: async (id: string): Promise<boolean> => {
    try {
      // If using Outlook and ID starts with 'o', use Outlook service
      if (await emailService.useOutlook() && id.startsWith('o')) {
        try {
          return await outlookService.toggleStar(id);
        } catch (error) {
          console.error("Outlook error toggling star:", error);
        }
      }
      
      // Use mock data as fallback
      await delay(300);
      const email = mockEmails.find(email => email.id === id);
      
      if (email) {
        email.isStarred = !email.isStarred;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in toggleStar:", error);
      return false;
    }
  },
  
  // Save draft in local storage and/or Outlook
  saveDraft: async (emailData: any): Promise<boolean> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          // Show notification that draft is being saved
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Saving Draft",
            description: "Your draft is being saved to Outlook...",
          });
          
          console.log("Saving draft via Outlook:", emailData);
          const success = await outlookService.saveDraft(emailData);
          
          if (success) {
            // Show success notification
            toast({
              title: "Draft Saved",
              description: "Your draft has been saved to Outlook.",
            });
            
            // Update counts
            window.dispatchEvent(new CustomEvent('emailsUpdated'));
          }
          
          return success;
        } catch (error) {
          console.error("Outlook error saving draft:", error);
          
          // Show error notification
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Error Saving Draft",
            description: "Failed to save draft to Outlook. Saved locally instead.",
            variant: "destructive",
          });
          
          // Fall back to localStorage if Outlook fails
        }
      }
      
      // Use localStorage as fallback
      await delay(500);
      try {
        const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
        const newDraft = {
          id: `draft_${Date.now()}`,
          ...emailData,
          createdAt: new Date().toISOString()
        };
        drafts.push(newDraft);
        localStorage.setItem('email_drafts', JSON.stringify(drafts));
        console.log('Draft saved to localStorage:', newDraft);
        
        // Show success notification
        const { toast } = await import("@/hooks/use-toast");
        toast({
          title: "Draft Saved",
          description: "Your draft has been saved locally.",
        });
        
        // Update counts
        window.dispatchEvent(new CustomEvent('emailsUpdated'));
        
        return true;
      } catch (error) {
        console.error('Error saving draft to localStorage:', error);
        return false;
      }
    } catch (error) {
      console.error("Error in saveDraft:", error);
      return false;
    }
  },
  
  // Get all drafts
  getDrafts: async (): Promise<EmailPreview[]> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          console.log("Getting drafts from Outlook...");
          return await outlookService.getDrafts();
        } catch (error) {
          console.error("Outlook error getting drafts:", error);
          // Fall back to localStorage if Outlook fails
        }
      }
      
      // Use localStorage as fallback
      await delay(500);
      try {
        const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
        return drafts.map((draft: any) => ({
          id: draft.id,
          subject: draft.subject || "(No Subject)",
          sender: {
            name: "You",
            email: localStorage.getItem('user_email') || "user@example.com",
            avatar: "https://i.pravatar.cc/150?img=1"
          },
          preview: draft.content?.substring(0, 50) + "..." || "Draft email...",
          time: new Date(draft.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          date: new Date(draft.createdAt).toLocaleDateString(),
          read: true,
          isStarred: false,
          hasAttachments: false,
          labels: ["Draft"]
        }));
      } catch (error) {
        console.error('Error getting drafts from localStorage:', error);
        return [];
      }
    } catch (error) {
      console.error("Error in getDrafts:", error);
      return [];
    }
  },
  
  // Get all sent emails
  getSentEmails: async (): Promise<EmailPreview[]> => {
    try {
      // Check if we should use Outlook
      const useOutlook = await emailService.useOutlook();
      
      if (useOutlook) {
        try {
          console.log("Getting sent emails from Outlook...");
          return await outlookService.getSentEmails();
        } catch (error) {
          console.error("Outlook error getting sent emails:", error);
          // Fall back to localStorage if Outlook fails
        }
      }
      
      // Use localStorage as fallback
      await delay(500);
      try {
        const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
        return sentEmails.map((email: any) => ({
          id: email.id,
          subject: email.subject || "(No Subject)",
          sender: {
            name: "You",
            email: localStorage.getItem('user_email') || "user@example.com",
            avatar: "https://i.pravatar.cc/150?img=1"
          },
          preview: `To: ${email.recipient} - ${email.content?.substring(0, 30)}...` || "Sent email...",
          time: new Date(email.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          date: new Date(email.sentAt).toLocaleDateString(),
          read: true,
          isStarred: false,
          hasAttachments: false,
          labels: ["Sent"]
        }));
      } catch (error) {
        console.error('Error getting sent emails from localStorage:', error);
        return [];
      }
    } catch (error) {
      console.error("Error in getSentEmails:", error);
      return [];
    }
  },
  
  // Get AI analysis for an email
  getAIAnalysis: async (emailContent: string): Promise<string> => {
    try {
      // First try to use the WebSocket AI service
      if (aiWebSocketService.isWebSocketConnected()) {
        // Create a promise to wait for the response
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("AI analysis timed out"));
          }, 15000); // 15 second timeout
          
          const messageHandler = (message: { id: string; role: 'user' | 'assistant'; content: string }) => {
            if (message.role === 'assistant') {
              clearTimeout(timeout);
              aiWebSocketService.removeMessageListener(messageHandler);
              resolve(message.content);
            }
          };
          
          aiWebSocketService.addMessageListener(messageHandler);
          aiWebSocketService.sendMessage("Analyze this email: " + emailContent);
        });
      } else {
        throw new Error("WebSocket AI service not connected");
      }
    } catch (error) {
      console.error("Error using WebSocket AI service:", error);
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return `This email appears to be about a project update. The sender is providing information about progress and requesting feedback. Consider responding with your thoughts on the current timeline.`;
    }
  },
};
