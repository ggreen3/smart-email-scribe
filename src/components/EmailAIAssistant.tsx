
import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Send, Loader2, WifiOff, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EmailDetail } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { aiWebSocketService, AIMessage } from "@/services/aiWebSocketService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial connection status and get system prompt
    const initialStatus = aiWebSocketService.isWebSocketConnected();
    setIsConnected(initialStatus);
    setSystemPrompt(aiWebSocketService.getSystemPrompt());
    
    if (!initialStatus) {
      console.log("AI service disconnected on mount, attempting to reconnect...");
      aiWebSocketService.reconnect();
    }

    const handleMessage = (message: AIMessage) => {
      if (message.role === 'assistant') {
        setAnalysis(message.content);
        setLoading(false);
      }
      setMessages(prev => [...prev, message]);
    };
    
    const handleConnectionStatus = (connected: boolean) => {
      console.log("AI connection status changed:", connected);
      setIsConnected(connected);
      
      if (!connected) {
        toast({
          title: "AI Disconnected ❌",
          description: "Lost connection to AI service. Trying to reconnect...",
          variant: "destructive"
        });
        setIsReconnecting(true);
      } else {
        if (reconnectAttempt > 0 || isReconnecting) {
          // Only show reconnection success if we previously tried to reconnect
          toast({
            title: "AI Connected ✅",
            description: "Successfully reconnected to AI service.",
          });
          setReconnectAttempt(0);
          setIsReconnecting(false);
        }
        
        // Update system prompt on successful connection
        setSystemPrompt(aiWebSocketService.getSystemPrompt());
      }
    };
    
    aiWebSocketService.addMessageListener(handleMessage);
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    
    return () => {
      aiWebSocketService.removeMessageListener(handleMessage);
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, [toast, reconnectAttempt, isReconnecting]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        description: "Cannot connect to AI service. Please try the reconnect button.",
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

  const handleReconnect = () => {
    setReconnectAttempt(prev => prev + 1);
    setIsReconnecting(true);
    
    toast({
      title: "Reconnecting...",
      description: "Attempting to reconnect to AI service."
    });
    
    // Force close and reopen the connection
    aiWebSocketService.reconnect();
    
    // Set a timeout to check if connection was successful
    setTimeout(() => {
      const newStatus = aiWebSocketService.isWebSocketConnected();
      if (!newStatus && reconnectAttempt >= 2) {
        toast({
          title: "Reconnection failed",
          description: "Still unable to connect. Please try again later or refresh the page.",
          variant: "destructive"
        });
        setIsReconnecting(false);
      }
    }, 5000);
  };
  
  // Handle "Enter" key press to send the query
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && query.trim() && isConnected) {
        handleAnalyze();
      }
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
            <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 text-xs flex items-center">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={handleReconnect}
              >
                <RefreshCw className={`h-3 w-3 ${isReconnecting ? 'animate-spin' : ''}`} />
              </Button>
            </Badge>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                <p>System prompt: {systemPrompt.substring(0, 100)}...</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about this email... 💬"
          className="mb-2"
          rows={3}
          disabled={!isConnected || loading}
        />
        
        <div className="flex space-x-2 mb-4">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !query.trim() || !isConnected}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        
        {messages.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className={`p-3 ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'} rounded-md`}>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    {message.role === 'assistant' ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                        AI Analysis ✨
                      </>
                    ) : (
                      'Your Question 🤔'
                    )}
                  </h4>
                  <div className="text-sm space-y-2">
                    {message.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="mt-4 pt-2 border-t border-blue-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setQuery("")}
                disabled={loading}
              >
                Ask another question 🔄
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
