
import { EmailPreview, EmailDetail } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

// This service handles Outlook API interactions
export const outlookService = {
  isConnected: false,
  authToken: null,
  connectionAttempts: 0,
  maxConnectionAttempts: 5,
  
  // Connect to Outlook - would use Microsoft Graph API in production
  connect: async (email: string, password: string = ""): Promise<boolean> => {
    try {
      console.log('Connecting to Outlook for:', email);
      // In a real implementation, this would handle OAuth2 flow with Microsoft
      outlookService.connectionAttempts = 0;
      
      // Save connection details to localStorage
      localStorage.setItem('outlook_connected', 'true');
      localStorage.setItem('outlook_email', email);
      localStorage.setItem('user_email', email); // Save for user profile
      
      // Store the connection time to help with debugging
      localStorage.setItem('outlook_connected_time', new Date().toISOString());
      
      // Ensure the connected state is set correctly
      outlookService.isConnected = true;
      console.log('Successfully connected to Outlook');
      
      // Dispatch event to notify components of connection
      window.dispatchEvent(new CustomEvent('outlookConnectionChanged', { detail: true }));
      window.dispatchEvent(new CustomEvent('userInfoUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      outlookService.isConnected = false;
      return false;
    }
  },
  
  // Check connection status - retrieve from localStorage
  checkConnection: (): boolean => {
    const connected = localStorage.getItem('outlook_connected') === 'true';
    outlookService.isConnected = connected;
    console.log('Checking Outlook connection:', connected);
    
    if (connected) {
      const email = localStorage.getItem('outlook_email');
      const connectedTime = localStorage.getItem('outlook_connected_time');
      console.log(`Connected as ${email} since ${connectedTime}`);
    }
    
    return connected;
  },
  
  // Disconnect from Outlook
  disconnect: async (): Promise<boolean> => {
    try {
      localStorage.removeItem('outlook_connected');
      localStorage.removeItem('outlook_email');
      localStorage.removeItem('outlook_connected_time');
      outlookService.isConnected = false;
      console.log('Disconnected from Outlook');
      
      // Dispatch event to notify components of disconnection
      window.dispatchEvent(new CustomEvent('outlookConnectionChanged', { detail: false }));
      window.dispatchEvent(new CustomEvent('userInfoUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from Outlook:', error);
      return false;
    }
  },
  
  // Get all emails from Outlook
  getEmails: async (): Promise<EmailPreview[]> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    // For demo, we'll return realistic-looking Outlook emails
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    // Get actual email count from localStorage or default to a random large number
    const emailCount = parseInt(localStorage.getItem('outlook_email_count') || '600');
    console.log(`Retrieving ${emailCount} emails from Outlook`);
    
    // Generate dynamic emails to simulate a large inbox
    const dynamicEmails: EmailPreview[] = [];
    
    // Add predefined emails first
    const outlookEmails = [
      {
        id: "o1",
        subject: "Weekly Team Sync - Action Items 📝",
        sender: {
          name: "Jennifer Parker",
          email: "jennifer.parker@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=32",
        },
        preview: "Hi team, Please see the action items from our weekly sync. We need to follow up on the...",
        time: "10:23 AM",
        date: "Today",
        read: false,
        isStarred: true,
        hasAttachments: true,
        labels: ["Work", "Important"],
      },
      {
        id: "o2",
        subject: "Microsoft 365 License Renewal 🔑",
        sender: {
          name: "Microsoft Account Team",
          email: "account@microsoft.com",
          avatar: "https://i.pravatar.cc/150?img=33",
        },
        preview: "Your Microsoft 365 subscription is up for renewal. Take action now to ensure continued...",
        time: "Yesterday",
        date: "Apr 8",
        read: true,
        isStarred: true,
        hasAttachments: false,
        labels: ["Important"],
      },
      {
        id: "o3",
        subject: "Project Odyssey - Status Update 🚀",
        sender: {
          name: "David Liu",
          email: "david.liu@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=51",
        },
        preview: "Team, I'm pleased to share that we've reached the milestone for Phase 2 of Project Odyssey...",
        time: "Apr 7",
        date: "Apr 7",
        read: true,
        isStarred: false,
        hasAttachments: true,
        labels: ["Work", "Project"],
      },
      {
        id: "o4",
        subject: "Team Building Event - RSVP Required 🎉",
        sender: {
          name: "HR Department",
          email: "hr@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=41",
        },
        preview: "We're excited to announce our quarterly team building event! Please RSVP by Friday...",
        time: "Apr 6",
        date: "Apr 6",
        read: false,
        isStarred: false,
        hasAttachments: true,
        labels: ["Work", "Social"],
      },
      {
        id: "o5",
        subject: "Quarterly Financial Report - Confidential 📊",
        sender: {
          name: "Finance Team",
          email: "finance@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=61",
        },
        preview: "Please find attached the quarterly financial report. This information is confidential...",
        time: "Apr 5",
        date: "Apr 5",
        read: true,
        isStarred: true,
        hasAttachments: true,
        labels: ["Work", "Finance", "Confidential"],
      },
      {
        id: "o6",
        subject: "New Product Launch Timeline 🚀",
        sender: {
          name: "Marketing Team",
          email: "marketing@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=22",
        },
        preview: "Here's the updated timeline for our upcoming product launch. Please review and provide feedback...",
        time: "Apr 4",
        date: "Apr 4",
        read: true,
        isStarred: true,
        hasAttachments: true,
        labels: ["Work", "Marketing"],
      },
      {
        id: "o7",
        subject: "Office 365 Tips & Tricks 💡",
        sender: {
          name: "IT Training",
          email: "it.training@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=37",
        },
        preview: "Discover these time-saving features in Office 365 that can boost your productivity...",
        time: "Apr 3",
        date: "Apr 3",
        read: false,
        isStarred: false,
        hasAttachments: false,
        labels: ["IT", "Training"],
      },
    ];
    
    dynamicEmails.push(...outlookEmails);
    
    // Generate additional emails to match the count
    const neededExtraEmails = Math.max(0, emailCount - outlookEmails.length);
    
    if (neededExtraEmails > 0) {
      console.log(`Generating ${neededExtraEmails} additional dynamic emails`);
      
      const senderDomains = ['outlook.com', 'microsoft.com', 'contoso.com', 'gmail.com', 'example.com'];
      const senderNames = ['Alex Johnson', 'Maria Garcia', 'Wei Chen', 'Aisha Patel', 'Carlos Rodriguez', 'Emma Wilson', 'James Smith', 'Sophia Lee'];
      const subjectPrefixes = ['RE: ', 'FWD: ', '', 'Update: ', 'Invitation: ', 'Action Required: ', 'Reminder: '];
      const subjectTopics = ['Project Update', 'Meeting Notes', 'Quarterly Report', 'Team Building', 'Invoice', 'Contract Review', 'Weekly Summary', 'Performance Review'];
      const labelOptions = ['Work', 'Important', 'Personal', 'Finance', 'Travel', 'Shopping', 'Social', 'Project'];
      
      // Different time formats for variety
      const timeOptions = [
        { recent: ['Just now', '5 min ago', '10 min ago', '30 min ago', '1 hour ago'] },
        { today: ['8:30 AM', '9:45 AM', '11:15 AM', '1:30 PM', '3:20 PM', '4:55 PM', '5:30 PM'] },
        { yesterday: ['Yesterday'] },
        { lastWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        { earlier: ['Apr 1', 'Apr 2', 'Apr 3', 'Mar 28', 'Mar 25', 'Mar 20', 'Mar 15', 'Mar 10'] }
      ];
      
      for (let i = 0; i < neededExtraEmails; i++) {
        // Generate random attributes for each email
        const randomSenderName = senderNames[Math.floor(Math.random() * senderNames.length)];
        const randomDomain = senderDomains[Math.floor(Math.random() * senderDomains.length)];
        const randomSubjectPrefix = subjectPrefixes[Math.floor(Math.random() * subjectPrefixes.length)];
        const randomSubjectTopic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
        
        // Randomly select time period and specific time
        const timePeriodsArray = Object.keys(timeOptions);
        const randomTimePeriodKey = timePeriodsArray[Math.floor(Math.random() * timePeriodsArray.length)];
        const randomTimePeriod = timeOptions[randomTimePeriodKey as keyof typeof timeOptions];
        const timeArray = Object.values(randomTimePeriod)[0];
        const randomTime = timeArray[Math.floor(Math.random() * timeArray.length)];
        
        // Generate a date based on the time period
        let emailDate;
        if (randomTimePeriodKey === 'recent' || randomTimePeriodKey === 'today') {
          emailDate = 'Today';
        } else if (randomTimePeriodKey === 'yesterday') {
          emailDate = 'Yesterday';
        } else if (randomTimePeriodKey === 'lastWeek') {
          emailDate = randomTime;
        } else {
          emailDate = randomTime;
        }
        
        // Generate random labels (0-2 labels)
        const labelCount = Math.floor(Math.random() * 3);
        const emailLabels = [];
        for (let j = 0; j < labelCount; j++) {
          const randomLabel = labelOptions[Math.floor(Math.random() * labelOptions.length)];
          if (!emailLabels.includes(randomLabel)) {
            emailLabels.push(randomLabel);
          }
        }
        
        // Create the dynamic email
        dynamicEmails.push({
          id: `o${outlookEmails.length + i}`,
          subject: `${randomSubjectPrefix}${randomSubjectTopic} ${Math.random() > 0.8 ? '📌' : ''}`,
          sender: {
            name: randomSenderName,
            email: `${randomSenderName.toLowerCase().replace(' ', '.')}@${randomDomain}`,
            avatar: `https://i.pravatar.cc/150?img=${20 + i % 70}`,
          },
          preview: `This is an automatically generated email #${i+1} for demonstration purposes. In a real app, this would contain actual email content...`,
          time: randomTimePeriodKey === 'recent' || randomTimePeriodKey === 'today' ? randomTime : '9:00 AM',
          date: emailDate,
          read: Math.random() > 0.3, // 70% chance of being read
          isStarred: Math.random() > 0.8, // 20% chance of being starred
          hasAttachments: Math.random() > 0.7, // 30% chance of having attachments
          labels: emailLabels,
        });
      }
    }
    
    console.log(`Returning ${dynamicEmails.length} Outlook emails`);
    
    // Store the count for future reference
    localStorage.setItem('outlook_email_count', dynamicEmails.length.toString());
    
    // Notify the UI to update
    window.dispatchEvent(new CustomEvent('emailsUpdated'));
    
    return dynamicEmails;
  },
  
  // Get a single email from Outlook
  getEmailById: async (id: string): Promise<EmailDetail | null> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    console.log("Getting Outlook email by ID:", id);
    
    const emails = {
      "o1": {
        id: "o1",
        subject: "Weekly Team Sync - Action Items 📝",
        sender: {
          name: "Jennifer Parker",
          email: "jennifer.parker@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=32",
        },
        preview: "Hi team, Please see the action items from our weekly sync. We need to follow up on the...",
        time: "10:23 AM",
        date: "Today",
        read: true,
        isStarred: true,
        hasAttachments: true,
        labels: ["Work", "Important"],
        body: `Hi team, 

Please see the action items from our weekly sync. We need to follow up on the following items by EOW:

1. Complete the Q2 roadmap presentation 📊
2. Schedule user research sessions for the new feature 👥
3. Review budget allocations for upcoming projects 💰
4. Prepare demo for executive presentation next week 🎯

Let me know if you have any questions or need clarification on any item.

Thanks,
Jennifer

P.S. Don't forget our team lunch on Friday! 🍕`,
        attachments: [
          { name: "Action_Items_April9.docx", size: "245 KB", type: "docx" },
          { name: "Q2_Roadmap_Draft.pptx", size: "1.2 MB", type: "pptx" },
        ],
      },
      "o2": {
        id: "o2",
        subject: "Microsoft 365 License Renewal 🔑",
        sender: {
          name: "Microsoft Account Team",
          email: "account@microsoft.com",
          avatar: "https://i.pravatar.cc/150?img=33",
        },
        preview: "Your Microsoft 365 subscription is up for renewal. Take action now to ensure continued...",
        time: "Yesterday",
        date: "Apr 8",
        read: true,
        isStarred: true,
        hasAttachments: false,
        labels: ["Important"],
        body: `Dear Valued Customer,

Your Microsoft 365 subscription is up for renewal. Take action now to ensure continued access to all the apps and services you rely on.

Your subscription details:
- Product: Microsoft 365 Business Standard
- Current period ends: May 8, 2025
- Monthly payment: $12.50/user/month

To renew your subscription:
1. Visit account.microsoft.com
2. Sign in with your account
3. Go to Services & subscriptions
4. Select Manage for your Microsoft 365 subscription
5. Update payment method if needed

If you have any questions about your subscription, please contact our support team.

Thank you for choosing Microsoft 365.

The Microsoft Account Team`,
      },
      "o3": {
        id: "o3",
        subject: "Project Odyssey - Status Update 🚀",
        sender: {
          name: "David Liu",
          email: "david.liu@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=51",
        },
        preview: "Team, I'm pleased to share that we've reached the milestone for Phase 2 of Project Odyssey...",
        time: "Apr 7",
        date: "Apr 7",
        read: true,
        isStarred: false,
        hasAttachments: true,
        labels: ["Work", "Project"],
        body: `Team,

I'm pleased to share that we've reached the milestone for Phase 2 of Project Odyssey! 🎉

Here's a quick summary of our achievements:
- Successfully deployed the new architecture to staging environment
- Completed performance testing with 30% improvement over baseline
- Resolved 95% of high-priority bugs
- Finalized documentation for the API endpoints

Next steps:
1. Final security audit (scheduled for April 12)
2. User acceptance testing (April 15-19)
3. Production deployment planning (April 21)

I've attached the detailed metrics and the updated project timeline for your reference.

Great work everyone! Let's keep the momentum going for our final phase.

Best regards,
David`,
        attachments: [
          { name: "Performance_Metrics_Phase2.xlsx", size: "756 KB", type: "xlsx" },
          { name: "Odyssey_Timeline_Updated.pdf", size: "1.4 MB", type: "pdf" },
        ],
      },
      "o4": {
        id: "o4",
        subject: "Team Building Event - RSVP Required 🎉",
        sender: {
          name: "HR Department",
          email: "hr@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=41",
        },
        preview: "We're excited to announce our quarterly team building event! Please RSVP by Friday...",
        time: "Apr 6",
        date: "Apr 6",
        read: false,
        isStarred: false,
        hasAttachments: true,
        labels: ["Work", "Social"],
        body: `Hello everyone!

We're excited to announce our quarterly team building event! 🎉

Event Details:
- Date: April 22, 2025
- Time: 1:00 PM - 5:00 PM
- Location: Woodland Park, East Pavilion
- Activity: Outdoor Adventure Challenge & BBQ

This quarter's event focuses on collaborative problem-solving and communication in a fun outdoor setting. Teams will navigate through various challenge stations that will test your creativity, teamwork, and strategic thinking.

Please RSVP by Friday, April 12, by clicking the link below:
[RSVP Link - In a real email, this would be a clickable link]

Dietary restrictions? Let us know in your RSVP so we can ensure everyone has delicious options at the BBQ.

I've attached the full agenda and what to bring/wear for the event.

Looking forward to seeing everyone there!

Best regards,
HR Team`,
        attachments: [
          { name: "Team_Building_Agenda.pdf", size: "425 KB", type: "pdf" },
          { name: "Park_Directions.jpg", size: "1.1 MB", type: "jpg" },
        ],
      },
      "o5": {
        id: "o5",
        subject: "Quarterly Financial Report - Confidential 📊",
        sender: {
          name: "Finance Team",
          email: "finance@contoso.com",
          avatar: "https://i.pravatar.cc/150?img=61",
        },
        preview: "Please find attached the quarterly financial report. This information is confidential...",
        time: "Apr 5",
        date: "Apr 5",
        read: true,
        isStarred: true,
        hasAttachments: true,
        labels: ["Work", "Finance", "Confidential"],
        body: `Dear Leadership Team,

Please find attached the quarterly financial report for Q1 2025. This information is confidential and should not be shared outside of the leadership team.

Key Highlights:
- Revenue increased by 18% compared to previous quarter
- Operating expenses decreased by 5%
- Profit margins improved to 24% (up from 19% in Q4 2024)
- Sales in new markets exceeded projections by 12%

Areas of Concern:
- Supply chain costs continue to rise (8% increase)
- Delayed launch of Product X impacted projected revenue
- Customer acquisition cost increased by 3%

We'll be reviewing these details in depth during the quarterly financial review meeting scheduled for April 15th at 10:00 AM.

If you have any questions before the meeting, please don't hesitate to reach out.

Regards,
Finance Team`,
        attachments: [
          { name: "Q1_2025_Financial_Report.pdf", size: "2.8 MB", type: "pdf" },
          { name: "Q1_2025_Metrics_Dashboard.xlsx", size: "1.5 MB", type: "xlsx" },
        ],
      },
    };
    
    // If the email exists in our predefined list, return it
    if (emails[id]) {
      console.log("Found Outlook email:", emails[id].subject);
      return emails[id];
    }
    
    // For IDs not in the predefined list but starting with 'o', generate a dummy email
    if (id.startsWith('o')) {
      console.log("Generating dynamic Outlook email for unknown ID:", id);
      return {
        id: id,
        subject: `Dynamic Outlook Email #${id.substr(1)} 📧`,
        sender: {
          name: "Outlook User",
          email: "user@outlook.com",
          avatar: "https://i.pravatar.cc/150?img=70",
        },
        preview: "This is a dynamically generated email for unknown Outlook IDs...",
        time: "11:00 AM",
        date: "Today",
        read: true,
        isStarred: false,
        hasAttachments: false,
        labels: ["Outlook", "Generated"],
        body: `This is a dynamically generated email for unknown Outlook IDs.

The requested ID was: ${id}

In a real implementation, this would be fetched from Microsoft Graph API.

Best regards,
Outlook Service`,
      };
    }
    
    console.log("No matching Outlook email found for ID:", id);
    return null;
  },
  
  // Send an email via Outlook
  sendEmail: async (emailData: any): Promise<boolean> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    console.log('Sending email via Outlook:', emailData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    try {
      // Store the sent email in localStorage
      const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
      const newEmail = {
        id: `osent_${Date.now()}`,
        ...emailData,
        sentAt: new Date().toISOString()
      };
      sentEmails.push(newEmail);
      localStorage.setItem('email_sent', JSON.stringify(sentEmails));
      
      // Update email count
      const currentCount = parseInt(localStorage.getItem('outlook_email_count') || '0');
      localStorage.setItem('outlook_email_count', (currentCount + 1).toString());
      
      // Notify the UI to update
      window.dispatchEvent(new CustomEvent('emailsUpdated'));
      return true;
    } catch (error) {
      console.error('Error saving sent email:', error);
      return false;
    }
  },
  
  // Mark an email as read in Outlook
  markAsRead: async (id: string): Promise<boolean> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    console.log('Marking email as read in Outlook:', id);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    return true;
  },
  
  // Toggle star status of an email in Outlook
  toggleStar: async (id: string): Promise<boolean> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    console.log('Toggling star status in Outlook:', id);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    return true;
  },
  
  // Save draft in Outlook
  saveDraft: async (emailData: any): Promise<boolean> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    console.log('Saving draft via Outlook:', emailData);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // Also save in localStorage for offline access
    try {
      const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
      const newDraft = {
        id: `odraft_${Date.now()}`,
        ...emailData,
        createdAt: new Date().toISOString()
      };
      drafts.push(newDraft);
      localStorage.setItem('email_drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving Outlook draft to localStorage:', error);
    }
    
    return true;
  },
  
  // Get drafts from Outlook
  getDrafts: async (): Promise<EmailPreview[]> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    // For demo, we'll return drafts from localStorage with Outlook prefixes
    try {
      const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
      const outlookEmail = localStorage.getItem('outlook_email');
      
      return drafts.filter((draft: any) => draft.id.startsWith('odraft_')).map((draft: any, index: number) => ({
        id: draft.id || `odraft_${Date.now()}_${index}`,
        subject: draft.subject || "Draft: No Subject",
        sender: {
          name: "You (Outlook)",
          email: outlookEmail || "outlook@example.com",
          avatar: "https://i.pravatar.cc/150?img=1",
        },
        preview: draft.content?.substring(0, 50) + "..." || "Draft email...",
        time: new Date(draft.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: new Date(draft.createdAt).toLocaleDateString(),
        read: true,
        isStarred: false,
        hasAttachments: false,
        labels: ["Draft", "Outlook"],
      }));
    } catch (error) {
      console.error('Error getting Outlook drafts:', error);
      return [];
    }
  },
  
  // Get sent emails from Outlook
  getSentEmails: async (): Promise<EmailPreview[]> => {
    if (!outlookService.checkConnection()) {
      console.error('Not connected to Outlook');
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    // Check if there are any sent emails in localStorage
    try {
      const sentEmails = JSON.parse(localStorage.getItem('email_sent') || '[]');
      const outlookEmail = localStorage.getItem('outlook_email');
      
      if (sentEmails.length > 0) {
        console.log(`Retrieved ${sentEmails.length} sent emails from Outlook`);
        return sentEmails.map((email: any, index: number) => ({
          id: email.id || `osent_${Date.now()}_${index}`,
          subject: email.subject || "(No Subject)",
          sender: {
            name: "You (Outlook)",
            email: outlookEmail || "outlook@example.com",
            avatar: "https://i.pravatar.cc/150?img=1",
          },
          preview: `To: ${email.recipient} - ${email.content?.substring(0, 30)}...` || "Sent email...",
          time: new Date(email.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          date: new Date(email.sentAt).toLocaleDateString(),
          read: true,
          isStarred: false,
          hasAttachments: false,
          labels: ["Sent", "Outlook"],
        }));
      }
      
      // If no emails in localStorage, generate 20 fake sent emails
      console.log('Generating demo sent emails for Outlook');
      const fakeEmails = [];
      const recipients = [
        'sarah.johnson@example.com', 
        'john.smith@company.com', 
        'david.miller@organization.org',
        'lisa.wong@partner.com',
        'michael.brown@client.net'
      ];
      const subjects = [
        'Re: Project Status Update',
        'Meeting Confirmation',
        'Document Review Request',
        'Weekly Progress Report',
        'Invoice Payment Confirmation',
        'Thank you for your inquiry',
        'Follow-up from our call',
        'Proposal for new collaboration'
      ];
      
      for (let i = 0; i < 20; i++) {
        const randomRecipient = recipients[Math.floor(Math.random() * recipients.length)];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        
        // Create random date within last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        fakeEmails.push({
          id: `osent_demo_${i}`,
          subject: randomSubject,
          sender: {
            name: "You (Outlook)",
            email: outlookEmail || "outlook@example.com",
            avatar: "https://i.pravatar.cc/150?img=1",
          },
          preview: `To: ${randomRecipient} - This is a sample sent email that would contain the actual content...`,
          time: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          date: date.toLocaleDateString(),
          read: true,
          isStarred: Math.random() > 0.8, // 20% chance of being starred
          hasAttachments: Math.random() > 0.7, // 30% chance of having attachments
          labels: ["Sent", "Outlook"],
        });
      }
      
      return fakeEmails;
    } catch (error) {
      console.error('Error getting sent emails from localStorage:', error);
      return [];
    }
  }
};
