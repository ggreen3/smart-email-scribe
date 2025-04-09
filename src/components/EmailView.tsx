
import { useState } from "react";
import { ArrowLeft, Reply, Forward, Star, Trash2, Archive, MoreHorizontal, Paperclip, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailDetail } from "@/types/email";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EmailAIAssistant from "./EmailAIAssistant";

interface EmailViewProps {
  email: EmailDetail | null;
  onBack: () => void;
  onReply: (emailId: string) => void;
}

export default function EmailView({ email, onBack, onReply }: EmailViewProps) {
  const [showAI, setShowAI] = useState(false);
  
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-email-text-muted">
        Select an email to view its contents.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Email header */}
      <div className="p-4 border-b border-email-border flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Forward className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="ml-auto flex space-x-1">
          <Button 
            variant={showAI ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowAI(!showAI)}
          >
            AI Assistant
          </Button>
          <Button variant="ghost" size="sm">
            <Star className={cn(
              "h-4 w-4",
              email.isStarred && "fill-yellow-400 text-yellow-400"
            )} />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Email content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">{email.subject}</h1>
            
            <div className="flex items-start mb-6">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-medium">{email.sender.name}</span>
                    <span className="text-email-text-muted ml-2 text-sm">&lt;{email.sender.email}&gt;</span>
                  </div>
                  <span className="text-email-text-muted text-sm">{email.date} at {email.time}</span>
                </div>
                
                <div className="text-email-text-muted text-sm mt-1">
                  To: me 
                  {email.cc && email.cc.length > 0 && (
                    <span>, cc: {email.cc.map(cc => cc.name).join(', ')}</span>
                  )}
                </div>
                
                {email.labels && email.labels.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {email.labels.map((label, i) => (
                      <Badge key={i} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="email-body prose max-w-none">
              {email.body.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-8 border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attachments ({email.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {email.attachments.map((attachment, i) => (
                    <div 
                      key={i}
                      className="flex items-center p-2 border rounded-md hover:bg-email-hover"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                        <span className="text-xs uppercase">{attachment.type}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-email-text-muted">{attachment.size}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onReply(email.id)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        </div>
        
        {/* AI Assistant panel */}
        {showAI && (
          <EmailAIAssistant 
            email={email}
            onClose={() => setShowAI(false)}
          />
        )}
      </div>
    </div>
  );
}
