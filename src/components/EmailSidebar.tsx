
import { useState } from "react";
import { 
  Mail, Send, File, Archive, Trash2, Settings, Star, Users, 
  AlertCircle, Clock, Coins, Search, ChevronRight, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  count?: number;
  isActive?: boolean;
  path?: string;
};

type ClientGroup = {
  name: string;
  count: number;
  path: string;
};

const folders: SidebarItem[] = [
  { name: "Inbox", icon: Mail, count: 12, isActive: true, path: "/" },
  { name: "Sent", icon: Send, count: 0, path: "/sent" },
  { name: "Drafts", icon: File, count: 3, path: "/drafts" },
  { name: "Archive", icon: Archive, count: 0, path: "/archive" },
  { name: "Spam", icon: AlertCircle, count: 0, path: "/spam" },
  { name: "Trash", icon: Trash2, count: 0, path: "/trash" },
];

const categories: SidebarItem[] = [
  { name: "Important", icon: Star, count: 4, path: "/important" },
  { name: "People", icon: Users, count: 8, path: "/people" },
  { name: "Chasers", icon: Clock, count: 2, path: "/chasers" },
  { name: "Financials", icon: Coins, count: 5, path: "/financials" },
  { name: "Search", icon: Search, path: "/search" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const clients: ClientGroup[] = [
  { name: "Acme Corp", count: 3, path: "/clients/acme-corp" },
  { name: "Globex", count: 5, path: "/clients/globex" },
  { name: "Initech", count: 2, path: "/clients/initech" },
  { name: "Stark Industries", count: 7, path: "/clients/stark-industries" },
];

export default function EmailSidebar() {
  const [showClients, setShowClients] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <div className="w-64 h-screen bg-email-sidepanel border-r border-email-border flex flex-col">
      <div className="p-4">
        <Button variant="default" className="w-full" onClick={() => setComposeOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-email-text-secondary uppercase tracking-wider">
            Folders
          </h2>
          <div className="space-y-1">
            {folders.map((folder) => (
              <Link
                key={folder.name}
                to={folder.path || "#"}
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm rounded-md",
                  folder.isActive
                    ? "bg-email-hover text-email-primary font-medium"
                    : "text-email-text-primary hover:bg-email-hover hover:text-email-primary"
                )}
              >
                <div className="flex items-center">
                  <folder.icon className="mr-3 h-4 w-4" />
                  <span>{folder.name}</span>
                </div>
                {typeof folder.count === "number" && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    folder.isActive ? "bg-email-primary text-white" : "bg-gray-100 text-email-text-secondary"
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
            Categories
          </h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path || "#"}
                className="flex items-center justify-between px-4 py-2 text-sm rounded-md text-email-text-primary hover:bg-email-hover hover:text-email-primary"
              >
                <div className="flex items-center">
                  <category.icon className="mr-3 h-4 w-4" />
                  <span>{category.name}</span>
                </div>
                {typeof category.count === "number" && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-email-text-secondary">
                    {category.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <Collapsible open={showClients} onOpenChange={setShowClients}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm rounded-md text-email-text-primary hover:bg-email-hover hover:text-email-primary">
              <div className="flex items-center">
                <Users className="mr-3 h-4 w-4" />
                <span>Clients</span>
              </div>
              {showClients ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-7 mt-1 space-y-1">
                {clients.map((client) => (
                  <Link
                    key={client.name}
                    to={client.path}
                    className="flex items-center justify-between px-4 py-2 text-sm rounded-md text-email-text-primary hover:bg-email-hover hover:text-email-primary"
                  >
                    <span>{client.name}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-email-text-secondary">
                      {client.count}
                    </span>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>
      
      <div className="p-4 border-t border-email-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-email-primary text-white flex items-center justify-center">
            <span className="text-sm font-medium">US</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-email-text-primary">User</p>
            <p className="text-xs text-email-text-secondary">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
