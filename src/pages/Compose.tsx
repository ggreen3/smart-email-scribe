
import { useState, useEffect } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { emailService } from "@/services/emailService";
import { Loader2 } from "lucide-react";

export default function Compose() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're editing a draft
  useEffect(() => {
    const state = location.state as any;
    if (state?.draft) {
      setSubject(state.draft.subject || "");
      setRecipient(state.draft.recipient || "");
      setContent(state.draft.content || "");
      setIsDraft(true);
      setDraftId(state.draft.id || null);
      
      toast({
        title: "Draft Loaded",
        description: "You're editing a saved draft.",
      });
    } else if (state?.replyTo) {
      // Handle reply to email
      setSubject(state.replyTo.subject.startsWith("Re:") ? state.replyTo.subject : `Re: ${state.replyTo.subject}`);
      setRecipient(state.replyTo.sender.email);
      setContent(`\n\n\n-------- Original Message --------\nFrom: ${state.replyTo.sender.name} <${state.replyTo.sender.email}>\nDate: ${state.replyTo.date}\nSubject: ${state.replyTo.subject}\n\n${state.replyTo.body || ""}`);
      
      toast({
        title: "Reply Started",
        description: `Replying to ${state.replyTo.sender.name}.`,
      });
    }
  }, [location]);
  
  const handleSend = async () => {
    if (!recipient || !subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create email data
      const emailData = {
        subject,
        recipient,
        content,
        sentAt: new Date().toISOString(),
        id: isDraft && draftId ? draftId : `sent_${Date.now()}`
      };
      
      // Send the email
      const success = await emailService.sendEmail(emailData);
      
      if (success) {
        toast({
          title: "Email sent",
          description: `Your email to ${recipient} has been sent.`,
        });
        
        // If this was a draft, remove it from drafts
        if (isDraft && draftId) {
          try {
            const drafts = JSON.parse(localStorage.getItem('email_drafts') || '[]');
            const updatedDrafts = drafts.filter((draft: any) => draft.id !== draftId);
            localStorage.setItem('email_drafts', JSON.stringify(updatedDrafts));
          } catch (error) {
            console.error("Error removing sent draft:", error);
          }
        }
        
        navigate("/sent");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: "There was a problem sending your email. It has been saved as a draft.",
        variant: "destructive",
      });
      
      // Save as draft if send fails
      handleSaveAsDraft();
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveAsDraft = async () => {
    if (!subject && !recipient && !content) {
      toast({
        title: "Empty draft",
        description: "There's nothing to save as a draft.",
      });
      navigate("/");
      return;
    }
    
    setLoading(true);
    try {
      // Create draft data
      const draftData = {
        id: isDraft && draftId ? draftId : undefined,
        subject,
        recipient,
        content,
        createdAt: new Date().toISOString()
      };
      
      // Save draft
      const success = await emailService.saveDraft(draftData);
      
      if (success) {
        toast({
          title: "Draft saved",
          description: "Your email has been saved to drafts.",
        });
        navigate("/drafts");
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: "There was a problem saving your draft.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDiscard = () => {
    if (subject || recipient || content) {
      const confirmDiscard = window.confirm("Do you want to save this email as a draft before discarding?");
      if (confirmDiscard) {
        handleSaveAsDraft();
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{isDraft ? "Edit Draft" : "Compose New Email"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium mb-1">To:</label>
                <Input 
                  id="recipient" 
                  placeholder="recipient@example.com" 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject:</label>
                <Input 
                  id="subject" 
                  placeholder="Email subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Message:</label>
                <Textarea 
                  id="content" 
                  placeholder="Type your message here..." 
                  className="min-h-[200px]"
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleDiscard} disabled={loading}>
                  Discard
                </Button>
                <Button variant="secondary" onClick={handleSaveAsDraft} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </Button>
                <Button onClick={handleSend} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Email"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
