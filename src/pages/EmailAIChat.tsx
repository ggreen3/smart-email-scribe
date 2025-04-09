
import { useState } from "react";
import { X, Send, Loader2, Brain, Copy, Search, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import EmailSidebar from "@/components/EmailSidebar";

type AIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type SearchResult = {
  id: string;
  subject: string;
  snippet: string;
  date: string;
};

export default function EmailAIChat() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your email assistant. You can ask me to find emails, summarize conversations, or help draft responses. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }]);
    
    setLoading(true);
    
    try {
      // Check if it's a search query
      if (userMessage.toLowerCase().includes('find') || userMessage.toLowerCase().includes('search')) {
        await handleSearchQuery(userMessage);
      } else {
        // Regular AI response
        await simulateAIResponse(userMessage);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchQuery = async (query: string) => {
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
    
    // Add AI response
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I found ${mockResults.length} emails matching your search. Here are the results:`
    }]);
  };

  const simulateAIResponse = async (userQuery: string) => {
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let response = '';
    
    if (userQuery.toLowerCase().includes('summarize')) {
      response = 'Based on your emails from the last 24 hours, you have 3 unread messages from clients, 2 pending action items, and an upcoming meeting tomorrow at 2:00 PM. Would you like me to generate a more detailed summary?';
    } else if (userQuery.toLowerCase().includes('draft') || userQuery.toLowerCase().includes('write')) {
      response = 'Here\'s a draft response:\n\nDear [Name],\n\nThank you for your email. I have reviewed the information you provided and would be happy to discuss this further. I\'m available for a call this Thursday or Friday afternoon if that works for your schedule.\n\nBest regards,\n[Your Name]';
    } else {
      response = 'I understand you\'re asking about "' + userQuery + '". Is there a specific email or set of emails you would like me to analyze? I can help you find, summarize, or draft responses to emails.';
    }
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: response
    }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard."
    });
  };

  const closeSearch = () => {
    setShowSearch(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-email-border flex items-center justify-between">
          <h2 className="font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            AI Email Assistant
          </h2>
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-full h-full flex flex-col overflow-hidden animate-slide-in">
          {showSearch ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 flex items-center justify-between">
                <h3 className="text-sm font-medium">Search Results</h3>
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
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
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
                    <span className="text-sm text-email-text-secondary">Thinking...</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-email-border">
                <div className="relative">
                  <Textarea
                    placeholder="Ask the AI assistant anything about your emails..."
                    className="min-h-24 pr-10"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute bottom-3 right-3"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-email-text-muted">
                  <p className="mb-1">Examples:</p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Find emails from Acme Corp about the Q1 report")}
                  >
                    Find emails from Acme Corp about the Q1 report
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Summarize my emails from today")}
                  >
                    Summarize my emails from today
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-email-primary"
                    onClick={() => setInput("Draft a follow-up email to John about the project")}
                  >
                    Draft a follow-up email to John about the project
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
