
import { useState, useEffect } from "react";
import { X, Sparkles, Send, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EmailDetail } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { aiWebSocketService, AIMessage } from "@/services/aiWebSocketService";

interface EmailAIAssistantProps {
  email: EmailDetail;
  onClose: () => void;
}

export default function EmailAIAssistant({ email, onClose }: EmailAIAssistantProps) {
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (message: AIMessage) => {
      if (message.role === 'assistant') {
        setAnalysis(message.content);
        setLoading(false);
      }
      setMessages(prev => [...prev, message]);
    };
    
    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
    };
    
    aiWebSocketService.addMessageListener(handleMessage);
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    
    return () => {
      aiWebSocketService.removeMessageListener(handleMessage);
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a question 🤔",
        description: "Ask the AI assistant a question about this email.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isConnected) {
      toast({
        title: "AI Service Disconnected ❌",
        description: "Cannot connect to AI service. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setAnalysis(null);
    
    try {
      // Create email context
      const emailContext = `
Subject: ${email.subject}
From: ${email.sender.name} <${email.sender.email}>
Date: ${email.date} at ${email.time}
Content: ${email.body}
      `.trim();
      
      // Send the message with context to the WebSocket service
      aiWebSocketService.sendMessage(query, emailContext);
      
      toast({
        title: "Processing Query ✨",
        description: "AI is analyzing your email and query.",
      });
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Analysis failed ❌",
        description: "Could not generate AI analysis. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-96 border-l border-email-border h-full bg-white flex flex-col">
      <div className="p-4 border-b border-email-border flex justify-between items-center bg-blue-50">
        <div className="flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
          <h3 className="font-semibold">AI Email Assistant 🤖</h3>
          {isConnected ? (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 text-xs">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-sm text-email-text-secondary mb-4">
          Ask a question about this email or request assistance with drafting a response. ✨
        </p>
        
        <div className="space-y-2 mb-4">
          <p className="text-xs text-email-text-muted">Example questions:</p>
          <div className="space-y-1">
            <div className="p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer" 
                 onClick={() => setQuery("Summarize this email in 3 bullet points")}>
              • Summarize this email in 3 bullet points 📝
            </div>
            <div className="p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer"
                 onClick={() => setQuery("What actions are required from me?")}>
              • What actions are required from me? ✅
            </div>
            <div className="p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer"
                 onClick={() => setQuery("Draft a polite response indicating I'll review the documents")}>
              • Draft a polite response indicating I'll review the documents 📨
            </div>
          </div>
        </div>
        
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything about this email... 💬"
          className="mb-2"
          rows={3}
          disabled={!isConnected}
        />
        
        <div className="flex space-x-2 mb-4">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !query.trim() || !isConnected}
            className="flex-1"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing... ⏳
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Email 🔍
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleAnalyze} 
            disabled={loading || !query.trim() || !isConnected}
            aria-label="Send query"
            title="Send query"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {analysis && (
          <>
            <Separator className="my-4" />
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                AI Analysis ✨
              </h4>
              <div className="text-sm space-y-2">
                {analysis.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              <div className="mt-4 pt-2 border-t border-blue-100">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => setQuery("")}
                >
                  Ask another question 🔄
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
