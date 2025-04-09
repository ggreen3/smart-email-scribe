
import EmailSidebar from "@/components/EmailSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Compose() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSend = () => {
    if (!recipient || !subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email sent",
      description: `Your email to ${recipient} has been sent.`,
    });
    
    navigate("/");
  };
  
  const handleDiscard = () => {
    if (subject || recipient || content) {
      // If there's content, save to drafts
      toast({
        title: "Draft saved",
        description: "Your email has been saved to drafts.",
      });
    }
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Compose New Email</CardTitle>
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
                <Button variant="outline" onClick={handleDiscard}>Discard</Button>
                <Button onClick={handleSend}>Send Email</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
