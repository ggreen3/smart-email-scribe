
import { useState } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Building, Phone, Search, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive";
  unreadCount: number;
}

export default function ClientsList() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const clients: Client[] = [
    {
      id: "acme-corp",
      name: "John Doe",
      company: "Acme Corporation",
      email: "john.doe@acmecorp.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      unreadCount: 2
    },
    {
      id: "globex",
      name: "Jane Smith",
      company: "Globex Corporation",
      email: "jane.smith@globex.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      unreadCount: 1
    },
    {
      id: "initech",
      name: "Michael Johnson",
      company: "Initech",
      email: "michael@initech.com",
      phone: "+1 (555) 555-1234",
      status: "inactive",
      unreadCount: 0
    },
    {
      id: "stark-industries",
      name: "Tony Stark",
      company: "Stark Industries",
      email: "tony@stark.com",
      phone: "+1 (555) 789-4561",
      status: "active",
      unreadCount: 3
    }
  ];
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Clients</h1>
          
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-2">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{client.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                      </div>
                    </div>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.company}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full justify-between">
                    {client.unreadCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50">
                        {client.unreadCount} unread
                      </Badge>
                    )}
                    <div className="ml-auto">
                      <Button asChild>
                        <Link to={`/clients/${client.id}`}>View Client</Link>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">No clients found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
