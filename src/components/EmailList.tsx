
import { useState, useEffect } from "react";
import { Search, Filter, Star, Paperclip, Calendar, User, Tag, ChevronDown, ChevronUp, ArrowDownUp, Clock, BarChart, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmailPreview } from "@/types/email";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface EmailListProps {
  emails: EmailPreview[];
  selectedEmail: string | null;
  onSelectEmail: (id: string) => void;
  loading?: boolean;
}

type FilterType = "all" | "unread" | "flagged" | "attachments" | "recent";
type SortType = "date" | "sender" | "subject";
type SortDirection = "asc" | "desc";

export default function EmailList({ emails, selectedEmail, onSelectEmail, loading = false }: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showAISummary, setShowAISummary] = useState(true);
  const [filteredEmails, setFilteredEmails] = useState<EmailPreview[]>([]);
  const { toast } = useToast();

  // Apply filters when emails, searchQuery, or activeFilter changes
  useEffect(() => {
    let result = emails;
    
    // Text search
    if (searchQuery) {
      result = result.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filters
    switch (activeFilter) {
      case "unread":
        result = result.filter(email => !email.read);
        break;
      case "flagged":
        result = result.filter(email => email.isStarred);
        break;
      case "attachments":
        result = result.filter(email => email.hasAttachments);
        break;
      case "recent":
        // Assuming we'd have a dateReceived property in a real app
        // For now, we'll just filter to most recent based on time
        const today = new Date().toLocaleDateString();
        result = result.filter(email => email.date === "Today" || email.date === today);
        break;
      default:
        break;
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "sender") {
        return sortDirection === "asc" 
          ? a.sender.name.localeCompare(b.sender.name)
          : b.sender.name.localeCompare(a.sender.name);
      } else if (sortBy === "subject") {
        return sortDirection === "asc"
          ? a.subject.localeCompare(b.subject)
          : b.subject.localeCompare(a.subject);
      } else {
        // Sort by date (using the time string as a proxy)
        return sortDirection === "asc"
          ? a.time.localeCompare(b.time)
          : b.time.localeCompare(a.time);
      }
    });
    
    // Notify about filter results if there was an active search or filter
    if ((searchQuery || activeFilter !== "all") && result.length !== emails.length) {
      toast({
        title: "Filter Applied",
        description: `Found ${result.length} matching emails.`,
      });
    }
    
    setFilteredEmails(result);
  }, [emails, searchQuery, activeFilter, sortBy, sortDirection]);
  
  const toggleSort = (type: SortType) => {
    if (sortBy === type) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortDirection("desc");
    }
    
    toast({
      title: "Sorted Emails",
      description: `Sorted by ${type} in ${sortDirection === "asc" ? "descending" : "ascending"} order.`,
    });
  };

  const toggleFilter = () => {
    setShowFilters(!showFilters);
  };

  // Get counts for AI summary
  const getEmailCounts = () => {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    const recentEmails = emails.filter(email => {
      // For this demo, we'll just check for "Today" emails
      return email.date === "Today";
    });
    
    const unreadEmails = emails.filter(email => !email.read);
    const starredEmails = emails.filter(email => email.isStarred);
    
    return {
      recent: recentEmails.length,
      unread: unreadEmails.length,
      priority: starredEmails.length,
      awaiting: Math.min(5, Math.floor(unreadEmails.length / 2)) // Just for demo purposes
    };
  };

  const counts = getEmailCounts();

  return (
    <div className="w-80 h-screen border-r border-email-border flex flex-col bg-white">
      <div className="p-4 border-b border-email-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-email-text-muted" />
          <Input 
            type="text"
            placeholder="Search emails 🔍"
            className="pl-8 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {showAISummary && (
        <div className="p-3 border-b border-email-border bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold flex items-center">
              <BarChart className="h-3 w-3 mr-1" />
              AI Summary 📊
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowAISummary(false)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="text-xs font-medium">Last 4 hours</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">New emails</span>
                  <span className="text-xs font-medium">{counts.recent} 📥</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Unread</span>
                  <span className="text-xs font-medium">{counts.unread} 📩</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Priority</span>
                  <span className="text-xs font-medium">{counts.priority} ⚠️</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Awaiting response</span>
                  <span className="text-xs font-medium">{counts.awaiting} ⏱️</span>
                </div>
              </div>
              
              <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-2">
                View detailed report 📑
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="p-2 border-b border-email-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-email-text-secondary">
            {filteredEmails.length} messages 📬
          </span>
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-8">
                  <ArrowDownUp className="h-4 w-4 text-email-text-secondary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleSort("date")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Sort by Date {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("sender")}>
                  <User className="h-4 w-4 mr-2" />
                  Sort by Sender {sortBy === "sender" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("subject")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Sort by Subject {sortBy === "subject" && (sortDirection === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="p-1 h-8 ml-1" onClick={toggleFilter}>
              <Filter className="h-4 w-4 text-email-text-secondary" />
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="p-2 bg-gray-50 rounded-md mt-1 grid grid-cols-2 gap-1">
            <Button 
              variant={activeFilter === "all" ? "default" : "outline"} 
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveFilter("all")}
            >
              All 📧
            </Button>
            <Button 
              variant={activeFilter === "unread" ? "default" : "outline"} 
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveFilter("unread")}
            >
              Unread 📩
            </Button>
            <Button 
              variant={activeFilter === "flagged" ? "default" : "outline"} 
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveFilter("flagged")}
            >
              Flagged ⭐
            </Button>
            <Button 
              variant={activeFilter === "attachments" ? "default" : "outline"} 
              size="sm"
              className="text-xs h-7"
              onClick={() => setActiveFilter("attachments")}
            >
              Attachments 📎
            </Button>
            <Button 
              variant={activeFilter === "recent" ? "default" : "outline"} 
              size="sm"
              className="text-xs h-7 col-span-2"
              onClick={() => setActiveFilter("recent")}
            >
              Recent 🕒
            </Button>
            <div className="col-span-2 flex justify-end">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs p-0 mt-1"
                onClick={() => { 
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
              >
                Clear filters 🧹
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p>Loading emails...</p>
            </div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-4 text-center text-email-text-secondary">
            No matching emails found. 🤷‍♂️
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className={cn(
                "email-list-item p-3 border-b border-email-border hover:bg-gray-50 cursor-pointer",
                selectedEmail === email.id && "bg-blue-50 hover:bg-blue-50"
              )}
            >
              <div className="flex items-start mb-2">
                <Checkbox 
                  className="mr-2 mt-1" 
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      email.read ? "text-email-text-secondary" : "text-email-text-primary"
                    )}>
                      {email.sender.name}
                    </span>
                    <span className="text-xs text-email-text-muted whitespace-nowrap ml-2">
                      {email.time}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className={cn(
                "text-sm mb-1 truncate",
                email.read ? "font-normal text-email-text-secondary" : "font-semibold text-email-text-primary"
              )}>
                {email.subject}
              </h3>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-email-text-muted truncate">
                  {email.preview}
                </p>
                <div className="flex items-center space-x-1 ml-1 shrink-0">
                  {email.hasAttachments && (
                    <Paperclip className="h-3 w-3 text-email-text-muted" />
                  )}
                  {email.isStarred && (
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  )}
                  {email.labels && email.labels.map((label, i) => (
                    <Badge key={i} variant="outline" className="text-[0.65rem] px-1 py-0">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
