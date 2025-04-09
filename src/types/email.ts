
// Types for emails in the email list preview
export interface EmailPreview {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  preview: string;
  time: string;
  date: string;
  read: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labels?: string[];
}

// Types for detailed email view
export interface EmailDetail extends EmailPreview {
  body: string;
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  attachments?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
  threadId?: string;
}
