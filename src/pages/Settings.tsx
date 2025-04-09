
import { useState } from "react";
import { Mail, Shield, Bell, Globe, UserCog, Palette, ExternalLink, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import EmailSidebar from "@/components/EmailSidebar";

export default function Settings() {
  const [outlookConnected, setOutlookConnected] = useState(false);
  const { toast } = useToast();

  const handleConnectOutlook = () => {
    // In a real app, this would initiate OAuth flow with Microsoft
    setTimeout(() => {
      setOutlookConnected(true);
      toast({
        title: "✅ Connected to Outlook!",
        description: "Your Outlook account has been successfully connected.",
      });
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Settings ⚙️</h1>
          
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">
                <UserCog className="h-4 w-4 mr-2" /> Account
              </TabsTrigger>
              <TabsTrigger value="connections">
                <ExternalLink className="h-4 w-4 mr-2" /> Connections
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" /> Appearance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information 👤</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" defaultValue="User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="user@example.com" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="(UTC-08:00) Pacific Time" />
                  </div>
                  <Separator />
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="connections">
              <Card>
                <CardHeader>
                  <CardTitle>Email Connections 🔗</CardTitle>
                  <CardDescription>
                    Connect to external email services to sync your messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center mr-4">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Microsoft Outlook 📧</h3>
                        <p className="text-sm text-email-text-muted">
                          {outlookConnected ? "Connected" : "Connect to sync your Outlook emails and calendar"}
                        </p>
                      </div>
                    </div>
                    {outlookConnected ? (
                      <Button variant="outline" className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Connected
                      </Button>
                    ) : (
                      <Button onClick={handleConnectOutlook}>Connect</Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-red-100 rounded-md flex items-center justify-center mr-4">
                        <Mail className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Gmail 📨</h3>
                        <p className="text-sm text-email-text-muted">
                          Connect to sync your Gmail account
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings 🔔</CardTitle>
                  <CardDescription>
                    Customize how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-email-text-muted">
                        Receive notifications for new emails
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Desktop Notifications</h3>
                      <p className="text-sm text-email-text-muted">
                        Show notifications on your desktop
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Sound Alerts</h3>
                      <p className="text-sm text-email-text-muted">
                        Play sounds for new messages
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings 🎨</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode 🌙</h3>
                      <p className="text-sm text-email-text-muted">
                        Switch between light and dark mode
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Emojis 😊</h3>
                      <p className="text-sm text-email-text-muted">
                        Display emojis in the interface
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Compact View 📑</h3>
                      <p className="text-sm text-email-text-muted">
                        Show more emails in the inbox view
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
