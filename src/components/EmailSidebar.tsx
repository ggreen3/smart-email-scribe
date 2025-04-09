
import { Mail, Send, File, Archive, Trash2, Settings, Star, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  count?: number;
  isActive?: boolean;
};

const folders: SidebarItem[] = [
  { name: "Inbox", icon: Mail, count: 12, isActive: true },
  { name: "Sent", icon: Send, count: 0 },
  { name: "Drafts", icon: File, count: 3 },
  { name: "Archive", icon: Archive, count: 0 },
  { name: "Spam", icon: AlertCircle, count: 0 },
  { name: "Trash", icon: Trash2, count: 0 },
];

const categories: SidebarItem[] = [
  { name: "Important", icon: Star, count: 4 },
  { name: "People", icon: Users, count: 8 },
  { name: "Settings", icon: Settings },
];

export default function EmailSidebar() {
  return (
    <div className="w-64 h-screen bg-email-sidepanel border-r border-email-border flex flex-col">
      <div className="p-4">
        <Button variant="default" className="w-full">
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
              <a
                key={folder.name}
                href="#"
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
              </a>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-email-text-secondary uppercase tracking-wider">
            Categories
          </h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <a
                key={category.name}
                href="#"
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
              </a>
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
            <p className="text-sm font-medium text-email-text-primary">User</p>
            <p className="text-xs text-email-text-secondary">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
