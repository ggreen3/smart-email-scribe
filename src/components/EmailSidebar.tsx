
import { Mail, Send, File, Archive, Trash2, Settings, Star, Users, AlertCircle, BarChart4, Clock, Building, Calendar, Tag, Folder, Search, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  emoji?: string;
  count?: number;
  isActive?: boolean;
  path: string;
};

const folders: SidebarItem[] = [
  { name: "Inbox", icon: Mail, emoji: "📥", count: 12, isActive: true, path: "/" },
  { name: "Sent", icon: Send, emoji: "📤", count: 0, path: "/sent" },
  { name: "Drafts", icon: File, emoji: "📝", count: 3, path: "/drafts" },
  { name: "Archive", icon: Archive, emoji: "🗄️", count: 0, path: "/archive" },
  { name: "Spam", icon: AlertCircle, emoji: "⚠️", count: 0, path: "/spam" },
  { name: "Trash", icon: Trash2, emoji: "🗑️", count: 0, path: "/trash" },
];

const categories: SidebarItem[] = [
  { name: "Important", icon: Star, emoji: "⭐", count: 4, path: "/important" },
  { name: "People", icon: Users, emoji: "👥", count: 8, path: "/people" },
  { name: "Clients", icon: Building, emoji: "🏢", path: "/clients" },
  { name: "Chasers", icon: Clock, emoji: "⏱️", path: "/chasers" },
  { name: "Financials", icon: BarChart4, emoji: "💰", path: "/financials" },
  { name: "Calendar", icon: Calendar, emoji: "📅", path: "/calendar" },
  { name: "Newsletters", icon: BookOpen, emoji: "📚", path: "/newsletters" },
  { name: "Insights", icon: Search, emoji: "🔍", path: "/summaries" },
  { name: "AI Chat", icon: MessageSquare, emoji: "🤖", path: "/ai-chat" },
  { name: "Settings", icon: Settings, emoji: "⚙️", path: "/settings" },
];

export default function EmailSidebar() {
  // Check the current path to highlight the active link
  const currentPath = window.location.pathname;
  
  return (
    <div className="w-64 h-screen bg-email-sidepanel border-r border-email-border flex flex-col">
      <div className="p-4">
        <Button variant="default" className="w-full" asChild>
          <Link to="/compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose ✏️
          </Link>
        </Button>
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
                  currentPath === folder.path
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
                    currentPath === folder.path ? "bg-email-primary text-white" : "bg-gray-100 text-email-text-secondary"
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
                  currentPath === category.path
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
                    currentPath === category.path ? "bg-email-primary text-white" : "bg-gray-100 text-email-text-secondary"
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
            <span className="text-sm font-medium">US</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-email-text-primary">User 👤</p>
            <p className="text-xs text-email-text-secondary">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
