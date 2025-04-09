
import { useState, useEffect } from "react";
import { X, Send, Loader2, Brain, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { EmailDetail } from "@/types/email";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EmailAIAssistantProps {
  email: EmailDetail;
  onClose: () => void;
}

type AIResponse = {
  id: string;
  type: 'analysis' | 'suggestion' | 'response';
  title: string;
  content: string;
};

export default function EmailAIAssistant({ email, onClose }: EmailAIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  // Generate initial analysis when component mounts
  useEffect(() => {
    analyzeEmail();
  }, [email.id]);

  const analyzeEmail = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to your AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResponses([
        {
          id: '1',
          type: 'analysis',
          title: 'Email Summary',
          content: `This email is about ${email.subject.toLowerCase()}. The sender is requesting information about your availability for a meeting next week. The email has ${email.attachments?.length || 0} attachments.`
        },
        {
          id: '2',
          type: 'suggestion',
          title: 'Suggested Actions',
          content: 'Check your calendar for availability next week\nReview the attached documents before responding\nPrepare questions for the meeting topic'
        },
        {
          id: '3',
          type: 'response',
          title: 'Suggested Response',
          content: `Hi ${email.sender.name.split(' ')[0]},\n\nThank you for your email. I've reviewed your request and am available for a meeting next week. I have some availability on Tuesday and Thursday afternoon.\n\nI've looked through the attached documents and have a few questions I'd like to discuss during our meeting.\n\nLet me know which day works best for you, and I'll schedule it in my calendar.\n\nBest regards,\n[Your Name]`
        }
      ]);
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: "Error",
        description: "Failed to analyze the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const userQuery = query;
    setQuery('');
    
    try {
      // In a real app, this would be an API call to your AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResponses(prev => [...prev, {
        id: Date.now().toString(),
        type: 'response',
        title: 'Response to your question',
        content: `Based on your question: "${userQuery}"\n\nThe email indicates that ${email.sender.name} is looking for a response by the end of this week. I would recommend prioritizing this as it appears to be time-sensitive.\n\nWould you like me to draft a follow-up email for you?`
      }]);
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  return (
    <div className="w-96 h-full border-l border-email-border bg-white flex flex-col overflow-hidden animate-slide-in">
      <div className="p-4 border-b border-email-border flex items-center justify-between">
        <h2 className="font-medium flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          AI Email Assistant
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-email-text-muted">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p>Analyzing email content...</p>
          </div>
        ) : (
          responses.map((response) => (
            <div 
              key={response.id}
              className={cn(
                "rounded-lg p-4",
                response.type === 'analysis' ? "bg-blue-50" :
                response.type === 'suggestion' ? "bg-purple-50" :
                "bg-green-50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{response.title}</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(response.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm whitespace-pre-line">
                {response.content}
              </div>
            </div>
          ))
        )}
        
        {loading && responses.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-email-text-secondary">Processing...</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-email-border">
        <div className="relative">
          <Textarea
            placeholder="Ask the AI assistant a question..."
            className="min-h-24 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-3 right-3"
            onClick={handleSendQuery}
            disabled={loading || !query.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-email-text-muted">
          <p className="mb-1">Examples:</p>
          <Button 
            variant="link" 
            className="h-auto p-0 text-xs text-email-primary"
            onClick={() => setQuery("Draft a response to this email")}
          >
            Draft a response to this email
          </Button>
          <Separator className="my-1" />
          <Button 
            variant="link" 
            className="h-auto p-0 text-xs text-email-primary"
            onClick={() => setQuery("Summarize the key points")}
          >
            Summarize the key points
          </Button>
        </div>
      </div>
    </div>
  );
}
