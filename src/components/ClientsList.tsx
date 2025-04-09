
import { useState } from "react";
import { Users, Search, Filter, Building, Mail, Phone, ExternalLink, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

type ClientSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  website: string;
  status: 'active' | 'inactive';
  unreadEmails: number;
};

const mockClients: ClientSummary[] = [
  {
    id: 'acme-corp',
    name: 'John Doe',
    email: 'john.doe@acmecorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    avatar: undefined,
    website: 'www.acmecorp.com',
    status: 'active',
    unreadEmails: 0
  },
  {
    id: 'globex',
    name: 'Jane Smith',
    email: 'jane.smith@globex.com',
    phone: '+1 (555) 987-6543',
    company: 'Globex Corporation',
    avatar: undefined,
    website: 'www.globexcorp.com',
    status: 'active',
    unreadEmails: 1
  },
  {
    id: 'initech',
    name: 'Michael Johnson',
    email: 'michael@initech.com',
    phone: '+1 (555) 555-1234',
    company: 'Initech',
    avatar: undefined,
    website: 'www.initech.com',
    status: 'inactive',
    unreadEmails: 0
  },
  {
    id: 'stark-industries',
    name: 'Tony Stark',
    email: 'tony@stark.com',
    phone: '+1 (555) 789-4561',
    company: 'Stark Industries',
    avatar: undefined,
    website: 'www.stark-industries.com',
    status: 'active',
    unreadEmails: 1
  }
];

export default function ClientsList() {
  const [clients, setClients] = useState<ClientSummary[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const filteredClients = clients.filter(client => {
    // Search filter
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2 h-6 w-6" />
          Clients
        </h1>
        <Button>
          Add New Client
        </Button>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-email-text-muted" />
          <Input 
            type="text"
            placeholder="Search clients by name, company, or email"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow relative">
              {client.unreadEmails > 0 && (
                <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                  <Badge className="bg-email-primary">
                    {client.unreadEmails} new
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="text-xs" variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-email-text-secondary flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {client.company}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-email-text-muted" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-email-text-muted" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2 text-email-text-muted" />
                    <a 
                      href={`https://${client.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/clients/${client.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 flex items-center justify-center h-40 bg-gray-50 rounded-lg">
            <p className="text-email-text-muted">No clients found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
