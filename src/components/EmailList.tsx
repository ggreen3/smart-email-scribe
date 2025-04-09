
import { useState } from "react";
import { Search, Filter, Star, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailPreview } from "@/types/email";

interface EmailListProps {
  emails: EmailPreview[];
  selectedEmail: string | null;
  onSelectEmail: (id: string) => void;
}

export default function EmailList({ emails, selectedEmail, onSelectEmail }: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-screen border-r border-email-border flex flex-col bg-white">
      <div className="p-4 border-b border-email-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-email-text-muted" />
          <Input 
            type="text"
            placeholder="Search emails"
            className="pl-8 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-2 border-b border-email-border flex justify-between items-center">
        <span className="text-sm text-email-text-secondary">
          {filteredEmails.length} messages
        </span>
        <button className="p-1.5 rounded-md hover:bg-email-hover">
          <Filter className="h-4 w-4 text-email-text-secondary" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="p-4 text-center text-email-text-secondary">
            No matching emails found.
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className={cn(
                "email-list-item p-3 border-b border-email-border",
                selectedEmail === email.id && "selected"
              )}
            >
              <div className="flex items-start mb-2">
                <Checkbox 
                  className="mr-2 mt-1" 
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      email.read ? "text-email-text-secondary" : "text-email-text-primary"
                    )}>
                      {email.sender.name}
                    </span>
                    <span className="text-xs text-email-text-muted whitespace-nowrap ml-2">
                      {email.time}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className={cn(
                "text-sm mb-1 truncate",
                email.read ? "font-normal text-email-text-secondary" : "font-semibold text-email-text-primary"
              )}>
                {email.subject}
              </h3>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-email-text-muted truncate">
                  {email.preview}
                </p>
                <div className="flex items-center space-x-1 ml-1 shrink-0">
                  {email.hasAttachments && (
                    <Paperclip className="h-3 w-3 text-email-text-muted" />
                  )}
                  {email.isStarred && (
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  )}
                  {email.labels && email.labels.map((label, i) => (
                    <Badge key={i} variant="outline" className="text-[0.65rem] px-1 py-0">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
