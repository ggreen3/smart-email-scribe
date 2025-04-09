
import { EmailPreview, EmailDetail } from "@/types/email";

// This service handles Outlook API interactions
export const outlookService = {
  isConnected: false,
  authToken: null,
  
  // Connect to Outlook - would use Microsoft Graph API in production
  connect: async (email: string): Promise<boolean> => {
    try {
      console.log('Connecting to Outlook for:', email);
      // In a real implementation, this would handle OAuth2 flow with Microsoft
      // For demo purposes, we'll simulate a successful connection
      localStorage.setItem('outlook_connected', 'true');
      localStorage.setItem('outlook_email', email);
      outlookService.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      return false;
    }
  },
  
  // Check connection status - retrieve from localStorage
  checkConnection: (): boolean => {
    const connected = localStorage.getItem('outlook_connected') === 'true';
    outlookService.isConnected = connected;
    return connected;
  },
  
  // Disconnect from Outlook
  disconnect: async (): Promise<boolean> => {
    try {
      localStorage.removeItem('outlook_connected');
      localStorage.removeItem('outlook_email');
      outlookService.isConnected = false;
      return true;
    } catch (error) {
      console.error('Error disconnecting from Outlook:', error);
      return false;
    }
  },
  
  // Get all emails from Outlook
  getEmails: async (): Promise<EmailPreview[]> => {
    if (!outlookService.checkConnection()) {
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    // For demo, we'll return realistic-looking Outlook emails
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    return [
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
    ];
  },
  
  // Get a single email from Outlook
  getEmailById: async (id: string): Promise<EmailDetail | null> => {
    if (!outlookService.checkConnection()) {
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
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
    
    return emails[id] || null;
  },
  
  // Send an email via Outlook
  sendEmail: async (emailData: any): Promise<boolean> => {
    if (!outlookService.checkConnection()) {
      throw new Error('Not connected to Outlook');
    }
    
    // In a real implementation, this would call Microsoft Graph API
    console.log('Sending email via Outlook:', emailData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return true;
  }
};
