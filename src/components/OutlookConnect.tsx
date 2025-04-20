
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { outlookService } from "@/services/outlookService";
import { aiWebSocketService } from "@/services/aiWebSocketService";

interface OutlookConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function OutlookConnect({ open, onOpenChange, onConnected }: OutlookConnectProps) {
  const [outlookEmail, setOutlookEmail] = useState('');
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [emailLoadingError, setEmailLoadingError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectOutlook = async () => {
    if (!outlookEmail || outlookEmail.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter your Outlook email address.",
        variant: "destructive",
      });
      return;
    }
    
    setConnectingOutlook(true);
    setEmailLoadingError(null);
    
    try {
      console.log("Attempting to connect to Outlook with email:", outlookEmail);
      const success = await outlookService.connect(outlookEmail);
      
      if (success) {
        toast({
          title: "Outlook Connected ✅",
          description: `Successfully connected to Outlook (${outlookEmail}).`,
        });
        
        localStorage.setItem('outlook_email_count', '100');
        onConnected();
        onOpenChange(false);
        
        aiWebSocketService.setCustomSystemPrompt(
          "You are an AI assistant for email management. You now have access to the user's Outlook emails and can help organize, summarize, draft responses, and provide insights based on the full email context."
        );
        
        if (!aiWebSocketService.isWebSocketConnected()) {
          console.log("AI service disconnected, attempting to reconnect after Outlook setup");
          aiWebSocketService.reconnect();
        }
      } else {
        throw new Error("Failed to connect to Outlook");
      }
    } catch (error) {
      console.error("Error connecting to Outlook:", error);
      setEmailLoadingError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Connection Failed ❌",
        description: "Failed to connect to Outlook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingOutlook(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Outlook</DialogTitle>
          <DialogDescription>
            Connect to your Outlook account to access all your emails. We found you have over 600 emails that need to be imported.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="email"
              placeholder="Your Outlook email address"
              className="col-span-4"
              value={outlookEmail}
              onChange={(e) => setOutlookEmail(e.target.value)}
            />
          </div>
          {emailLoadingError && (
            <div className="col-span-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{emailLoadingError}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleConnectOutlook}
            disabled={connectingOutlook}
            className="w-full"
          >
            {connectingOutlook ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to Outlook'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
