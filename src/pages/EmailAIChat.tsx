import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, Brain, Copy, Search, Undo, Sparkles, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import EmailSidebar from "@/components/EmailSidebar";
import { aiWebSocketService, AIMessage } from "@/services/aiWebSocketService";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  id: string;
  subject: string;
  snippet: string;
  date: string;
};

export default function EmailAIChat() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your email assistant. You can ask me to find emails, summarize conversations, or help draft responses. How can I help you today? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle WebSocket connections and messages
  useEffect(() => {
    const handleMessage = (message: AIMessage) => {
      setMessages(prev => [...prev, message]);
      if (message.role === 'assistant') {
        setLoading(false);
      }
    };
    
    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
      if (connected) {
        toast({
          title: "AI Connected ✅",
          description: "Connected to AI service successfully."
        });
      } else {
        toast({
          title: "AI Disconnected ❌",
          description: "Lost connection to AI service. Trying to reconnect...",
          variant: "destructive"
        });
      }
    };
    
    aiWebSocketService.addMessageListener(handleMessage);
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    
    return () => {
      aiWebSocketService.removeMessageListener(handleMessage);
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, [toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);
    
    try {
      // Check if it's a search query
      if (userMessage.toLowerCase().includes('find') || userMessage.toLowerCase().includes('search')) {
        await handleSearchQuery(userMessage);
      } else {
        // Send message through WebSocket service with email context
        aiWebSocketService.sendMessageWithEmailContext(userMessage, "Email context would be provided here in a real implementation");
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error ❌",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSearchQuery = async (query: string) => {
    setLoading(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results based on query
      const mockResults = [
        { id: '1', subject: 'Q1 Financial Report', snippet: 'Attached is the Q1 financial report for your review...', date: 'Apr 5, 2025' },
        { id: '2', subject: 'Project Status Update', snippet: 'The team has completed the initial phase of the project...', date: 'Apr 3, 2025' },
        { id: '3', subject: 'Meeting Notes: Strategic Planning', snippet: 'Here are the notes from our strategic planning session...', date: 'Apr 1, 2025' },
      ];
      
      setSearchResults(mockResults);
      setShowSearch(true);
      
      // Add AI response via WebSocket
      aiWebSocketService.sendMessage(`I found ${mockResults.length} emails matching your search "${query}". Here are the results:`);
    } catch (error) {
      console.error('Error in search:', error);
      toast({
        title: "Search Failed ❌",
        description: "Failed to search emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard ✅",
      description: "The text has been copied to your clipboard."
    });
  };

  const closeSearch = () => {
    setShowSearch(false);
  };

  const handleSetCustomPrompt = () => {
    if (customPrompt.trim()) {
      aiWebSocketService.setCustomSystemPrompt(customPrompt);
      toast({
        title: "Custom Prompt Set ✅",
        description: "Your custom AI instructions have been applied."
      });
      setShowCustomPrompt(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-email-border flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            <h2 className="font-medium">AI Email Assistant 🤖</h2>
            {isConnected ? (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600">
                Connected ✅
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Custom Instructions
            </Button>
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showCustomPrompt && (
          <div className="p-4 border-b border-email-border bg-blue-50">
            <h3 className="text-sm font-medium mb-2">Set Custom AI Instructions ✨</h3>
            <Textarea
              placeholder="Enter custom instructions for the AI (e.g., 'You are an email assistant that helps me organize my emails...')"
              className="min-h-24 mb-2"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCustomPrompt(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSetCustomPrompt}
                disabled={!customPrompt.trim()}
              >
                Apply Instructions
              </Button>
            </div>
          </div>
        )}
        
        <div className="w-full h-full flex flex-col overflow-hidden animate-slide-in">
          {showSearch ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 flex items-center justify-between">
                <h3 className="text-sm font-medium">Search Results 🔍</h3>
                <Button variant="ghost" size="sm" onClick={closeSearch}>
                  <Undo className="h-4 w-4" />
                </Button>
              </div>
              <Command className="rounded-none border-0">
                <CommandInput placeholder="Refine your search..." />
                <CommandList className="max-h-[calc(100vh-10rem)]">
                  <CommandGroup heading="Results">
                    {searchResults.map((result) => (
                      <CommandItem key={result.id} className="flex flex-col items-start p-2">
                        <div className="flex justify-between w-full">
                          <span className="font-medium">{result.subject}</span>
                          <span className="text-xs text-muted-foreground">{result.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate w-full">
                          {result.snippet}
                        </p>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={cn(
                      "rounded-lg p-4",
                      message.role === 'user' ? "bg-blue-50 ml-4" : "bg-gray-50 mr-4"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">
                        {message.role === 'user' ? 'You 👤' : 'AI Assistant 🤖'}
                      </h3>
                      {message.role === 'assistant' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-email-text-secondary">Thinking... 🧠</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-email-border">
                <div className="relative">
                  <Textarea
                    placeholder="Ask the AI assistant anything about your emails... ✨"
                    className="min-h-24 pr-16"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || !isConnected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    className="absolute bottom-3 right-3"
                    disabled={loading || !input.trim() || !isConnected}
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4 mr-2" /> Send
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-email-text-muted">
                  <p className="mb-1">Examples:</p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Find emails from Acme Corp about the Q1 report")}
                    disabled={!isConnected}
                  >
                    Find emails from Acme Corp about the Q1 report 🔍
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Summarize my emails from today")}
                    disabled={!isConnected}
                  >
                    Summarize my emails from today 📋
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Draft a follow-up email to John about the project")}
                    disabled={!isConnected}
                  >
                    Draft a follow-up email to John about the project ✍️
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
