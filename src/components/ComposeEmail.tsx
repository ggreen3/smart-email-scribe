
import { useState } from "react";
import { X, Paperclip, Minus, Maximize2, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ComposeEmailProps {
  replyToEmail?: {
    id: string;
    sender: {
      name: string;
      email: string;
    };
    subject: string;
  };
  onClose: () => void;
  onSend: (emailData: any) => void;
}

export default function ComposeEmail({ replyToEmail, onClose, onSend }: ComposeEmailProps) {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [formData, setFormData] = useState({
    to: replyToEmail ? replyToEmail.sender.email : '',
    cc: '',
    bcc: '',
    subject: replyToEmail ? `Re: ${replyToEmail.subject}` : '',
    body: replyToEmail 
      ? `\n\n\n---------- Original Message ----------\nFrom: ${replyToEmail.sender.name} <${replyToEmail.sender.email}>\nSubject: ${replyToEmail.subject}\n` 
      : '',
  });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    onSend({
      ...formData,
      attachments: attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });
    onClose();
  };

  return (
    <div 
      className={cn(
        "fixed z-50 bg-white shadow-xl border border-email-border rounded-t-lg overflow-hidden transition-all",
        minimized ? "h-14 bottom-0 right-5 w-80" : "right-5 w-[600px]",
        maximized ? "top-0 right-0 left-0 bottom-0 w-full" : "bottom-0",
        !minimized && !maximized && "h-[80vh] max-h-[600px]"
      )}
    >
      {/* Header */}
      <div 
        className="bg-email-primary text-white p-3 flex items-center justify-between cursor-pointer"
        onClick={() => minimized ? setMinimized(false) : null}
      >
        <h3 className="font-medium text-sm">
          {replyToEmail ? `Reply: ${replyToEmail.subject}` : "New Message"}
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-email-highlight"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
              if (maximized) setMaximized(false);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-email-highlight"
            onClick={(e) => {
              e.stopPropagation();
              setMaximized(!maximized);
              if (minimized) setMinimized(false);
            }}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-email-highlight"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {!minimized && (
        <div className="flex flex-col h-[calc(100%-40px)]">
          {/* Email Form */}
          <div className="p-3 space-y-3">
            <div className="flex items-center">
              <label className="w-12 text-email-text-secondary text-sm">To:</label>
              <Input
                type="text"
                name="to"
                className="border-0 shadow-none focus-visible:ring-0 px-1 py-0 h-auto"
                value={formData.to}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="flex items-center">
              <div className="w-12 flex">
                {showCcBcc ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-email-text-secondary hover:text-email-text-primary"
                    onClick={() => setShowCcBcc(false)}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-6 p-0 text-email-text-secondary text-xs hover:text-email-primary"
                    onClick={() => setShowCcBcc(true)}
                  >
                    Cc/Bcc
                  </Button>
                )}
              </div>
            </div>
            
            {showCcBcc && (
              <>
                <div className="flex items-center">
                  <label className="w-12 text-email-text-secondary text-sm">Cc:</label>
                  <Input
                    type="text"
                    name="cc"
                    className="border-0 shadow-none focus-visible:ring-0 px-1 py-0 h-auto"
                    value={formData.cc}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="w-12 text-email-text-secondary text-sm">Bcc:</label>
                  <Input
                    type="text"
                    name="bcc"
                    className="border-0 shadow-none focus-visible:ring-0 px-1 py-0 h-auto"
                    value={formData.bcc}
                    onChange={handleFormChange}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center">
              <label className="w-12 text-email-text-secondary text-sm">Subject:</label>
              <Input
                type="text"
                name="subject"
                className="border-0 shadow-none focus-visible:ring-0 px-1 py-0 h-auto"
                value={formData.subject}
                onChange={handleFormChange}
              />
            </div>
            
            <Separator />
            
            <Textarea
              name="body"
              className="w-full flex-1 min-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 px-1"
              value={formData.body}
              onChange={handleFormChange}
            />
            
            {attachments.length > 0 && (
              <div className="border rounded-md p-2">
                <h4 className="text-xs font-medium mb-2">Attachments</h4>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2 text-sm">
                      <div className="truncate flex-1">
                        {file.name} <span className="text-email-text-muted text-xs">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-auto p-3 flex items-center justify-between border-t">
            <div className="flex items-center space-x-2">
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachmentChange}
                />
                <Button variant="outline" type="button" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
