
import { useEffect, useState } from "react";
import { Mail, Send, File, Archive, Trash2, Settings, Star, Users, AlertCircle, BarChart4, Clock, Building, Calendar, Tag, Folder, Search, BookOpen, MessageSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { emailService } from "@/services/emailService";
import { aiWebSocketService } from "@/services/aiWebSocketService";
import { useToast } from "@/hooks/use-toast";

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  emoji?: string;
  count?: number;
  isActive?: boolean;
  path: string;
};

export default function EmailSidebar() {
  const location = useLocation();
  const { toast } = useToast();
  const [counts, setCounts] = useState({
    inbox: 0,
    drafts: 0,
    sent: 0,
    archive: 0,
    spam: 0,
    trash: 0,
    important: 0
  });
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("user_name") || "User",
    email: localStorage.getItem("user_email") || localStorage.getItem("outlook_email") || "user@example.com"
  });
  const [loading, setLoading] = useState(false);
  const [isAIConnected, setIsAIConnected] = useState(false);
  
  // Listen for AI connection status
  useEffect(() => {
    const handleConnectionStatus = (connected: boolean) => {
      setIsAIConnected(connected);
    };
    
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    
    return () => {
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, []);
  
  // Load counts and user info
  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoading(true);
        
        // Get emails for count calculation
        const emails = await emailService.getEmails();
        const drafts = await emailService.getDrafts();
        const sent = await emailService.getSentEmails();
        
        // Calculate counts
        const unreadEmails = emails.filter(email => !email.read).length;
        const importantEmails = emails.filter(email => email.isStarred).length;
        
        setCounts({
          inbox: unreadEmails,
          drafts: drafts.length,
          sent: sent.length,
          archive: 0, // You can implement these later
          spam: 0,
          trash: 0,
          important: importantEmails
        });
        
        console.log("Updated counts:", {
          inbox: unreadEmails,
          drafts: drafts.length, 
          sent: sent.length,
          important: importantEmails
        });
      } catch (error) {
        console.error("Error loading email counts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load user info from localStorage
    const loadUserInfo = () => {
      const savedName = localStorage.getItem("user_name");
      const savedEmail = localStorage.getItem("user_email") || localStorage.getItem("outlook_email");
      
      if (savedName || savedEmail) {
        setUserInfo({
          name: savedName || "User",
          email: savedEmail || "user@example.com"
        });
      }
    };
    
    loadCounts();
    loadUserInfo();
    
    // Set up interval to refresh counts every 30 seconds
    const interval = setInterval(loadCounts, 30000);
    
    // Listen for custom events for email updates
    const handleEmailsUpdated = () => {
      console.log("Email update event detected - refreshing counts");
      loadCounts();
    };
    
    const handleUserInfoUpdated = () => {
      console.log("User info update event detected");
      loadUserInfo();
    };
    
    window.addEventListener('emailsUpdated', handleEmailsUpdated);
    window.addEventListener('userInfoUpdated', handleUserInfoUpdated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('emailsUpdated', handleEmailsUpdated);
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdated);
    };
  }, []);

  const handleRefresh = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      toast({
        title: "Refreshing Email Data",
        description: "Updating your email information...",
      });
      
      // Trigger a refresh of emails
      const emails = await emailService.getEmails();
      const drafts = await emailService.getDrafts();
      const sent = await emailService.getSentEmails();
      
      // Update counts
      const unreadEmails = emails.filter(email => !email.read).length;
      const importantEmails = emails.filter(email => email.isStarred).length;
      
      setCounts({
        inbox: unreadEmails,
        drafts: drafts.length,
        sent: sent.length,
        archive: 0,
        spam: 0,
        trash: 0,
        important: importantEmails
      });
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('emailsUpdated'));
      
      toast({
        title: "Refresh Complete",
        description: "Your email information has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Unable to update email information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const folders: SidebarItem[] = [
    { name: "Inbox", icon: Mail, emoji: "📥", count: counts.inbox, path: "/" },
    { name: "Sent", icon: Send, emoji: "📤", count: counts.sent, path: "/sent" },
    { name: "Drafts", icon: File, emoji: "📝", count: counts.drafts, path: "/drafts" },
    { name: "Archive", icon: Archive, emoji: "🗄️", count: counts.archive, path: "/archive" },
    { name: "Spam", icon: AlertCircle, emoji: "⚠️", count: counts.spam, path: "/spam" },
    { name: "Trash", icon: Trash2, emoji: "🗑️", count: counts.trash, path: "/trash" },
  ];

  const categories: SidebarItem[] = [
    { name: "Important", icon: Star, emoji: "⭐", count: counts.important, path: "/important" },
    { name: "People", icon: Users, emoji: "👥", path: "/people" },
    { name: "Clients", icon: Building, emoji: "🏢", path: "/clients" },
    { name: "Chasers", icon: Clock, emoji: "⏱️", path: "/chasers" },
    { name: "Financials", icon: BarChart4, emoji: "💰", path: "/financials" },
    { name: "Calendar", icon: Calendar, emoji: "📅", path: "/calendar" },
    { name: "Newsletters", icon: BookOpen, emoji: "📚", path: "/newsletters" },
    { name: "Insights", icon: Search, emoji: "🔍", path: "/summaries" },
    { name: "AI Chat", icon: MessageSquare, emoji: "🤖", path: "/ai-chat" },
    { name: "Settings", icon: Settings, emoji: "⚙️", path: "/settings" },
  ];
  
  return (
    <div className="w-64 h-screen bg-email-sidepanel border-r border-email-border flex flex-col">
      <div className="p-4">
        <Button variant="default" className="w-full" asChild>
          <Link to="/compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose ✏️
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-email-text-secondary"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {isAIConnected && (
          <div className="mt-2 text-xs text-center py-1 bg-green-50 text-green-700 rounded-md">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            AI Assistant Connected
          </div>
        )}
        
        {!isAIConnected && (
          <div className="mt-2 text-xs text-center py-1 bg-red-50 text-red-700 rounded-md">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            AI Assistant Disconnected
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-email-text-secondary uppercase tracking-wider">
            Folders 📁
          </h2>
          <div className="space-y-1">
            {folders.map((folder) => (
              <Link
                key={folder.name}
                to={folder.path}
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm rounded-md",
                  location.pathname === folder.path
                    ? "bg-email-hover text-email-primary font-medium"
                    : "text-email-text-primary hover:bg-email-hover hover:text-email-primary"
                )}
              >
                <div className="flex items-center">
                  <folder.icon className="mr-2 h-4 w-4" />
                  <span>{folder.name} {folder.emoji}</span>
                </div>
                {typeof folder.count === "number" && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    location.pathname === folder.path ? "bg-email-primary text-white" : "bg-gray-100 text-email-text-secondary"
                  )}>
                    {folder.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-email-text-secondary uppercase tracking-wider">
            Categories 🏷️
          </h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm rounded-md", 
                  location.pathname === category.path
                    ? "bg-email-hover text-email-primary font-medium"
                    : "text-email-text-primary hover:bg-email-hover hover:text-email-primary"
                )}
              >
                <div className="flex items-center">
                  <category.icon className="mr-2 h-4 w-4" />
                  <span>{category.name} {category.emoji}</span>
                </div>
                {typeof category.count === "number" && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    location.pathname === category.path ? "bg-email-primary text-white" : "bg-gray-100 text-email-text-secondary"
                  )}>
                    {category.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-email-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-email-primary text-white flex items-center justify-center">
            <span className="text-sm font-medium">{userInfo.name.charAt(0)}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-email-text-primary">{userInfo.name} 👤</p>
            <p className="text-xs text-email-text-secondary">{userInfo.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
