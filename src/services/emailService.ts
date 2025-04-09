
import { EmailPreview, EmailDetail } from "@/types/email";

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
  // Get all emails
  getEmails: async (): Promise<EmailPreview[]> => {
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
  },
  
  // Get a single email by ID
  getEmailById: async (id: string): Promise<EmailDetail | null> => {
    await delay(500);
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      // Mark as read
      email.read = true;
      return { ...email };
    }
    
    return null;
  },
  
  // Send a new email
  sendEmail: async (emailData: any): Promise<boolean> => {
    await delay(1000);
    console.log('Email sent:', emailData);
    return true;
  },
  
  // Mark email as read
  markAsRead: async (id: string): Promise<boolean> => {
    await delay(300);
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      email.read = true;
      return true;
    }
    
    return false;
  },
  
  // Star/unstar an email
  toggleStar: async (id: string): Promise<boolean> => {
    await delay(300);
    const email = mockEmails.find(email => email.id === id);
    
    if (email) {
      email.isStarred = !email.isStarred;
      return true;
    }
    
    return false;
  },
  
  // Get AI analysis for an email
  getAIAnalysis: async (emailContent: string): Promise<string> => {
    await delay(1500);
    return `This email appears to be about a project update. The sender is providing information about progress and requesting feedback. Consider responding with your thoughts on the current timeline.`;
  },
};
