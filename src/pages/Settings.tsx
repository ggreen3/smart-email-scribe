
import { useState, useEffect } from "react";
import { Mail, Shield, Bell, Globe, UserCog, Palette, ExternalLink, Check, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import EmailSidebar from "@/components/EmailSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { outlookService } from "@/services/outlookService";

export default function Settings() {
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [accountName, setAccountName] = useState("User");
  const [accountEmail, setAccountEmail] = useState("user@example.com");
  const [timezone, setTimezone] = useState("(UTC-08:00) Pacific Time");
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmojis, setShowEmojis] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const { toast } = useToast();

  // Load outlook connection status on component mount
  useEffect(() => {
    const connected = outlookService.checkConnection();
    setOutlookConnected(connected);
    
    // If connected, get the email from localStorage
    if (connected) {
      const email = localStorage.getItem('outlook_email');
      if (email) {
        setAccountEmail(email);
      }
    }
    
    // Load user preferences from localStorage
    const savedName = localStorage.getItem('user_name');
    if (savedName) setAccountName(savedName);
    
    const savedTimezone = localStorage.getItem('user_timezone');
    if (savedTimezone) setTimezone(savedTimezone);
    
    const darkMode = localStorage.getItem('dark_mode') === 'true';
    setIsDarkMode(darkMode);
    
    const emojis = localStorage.getItem('show_emojis') !== 'false'; // default true
    setShowEmojis(emojis);
    
    const compact = localStorage.getItem('compact_view') === 'true';
    setCompactView(compact);
  }, []);

  const handleConnectOutlook = async () => {
    // In a real app, this would initiate OAuth flow with Microsoft
    setIsSaving(true);
    try {
      const success = await outlookService.connect(accountEmail);
      if (success) {
        setOutlookConnected(true);
        toast({
          title: "✅ Connected to Outlook!",
          description: "Your Outlook account has been successfully connected.",
        });
      } else {
        toast({
          title: "❌ Connection failed",
          description: "Could not connect to Outlook. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Connection error",
        description: "An error occurred while connecting to Outlook.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    setIsSaving(true);
    try {
      const success = await outlookService.disconnect();
      if (success) {
        setOutlookConnected(false);
        toast({
          title: "✅ Disconnected from Outlook",
          description: "Your Outlook account has been disconnected.",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Could not disconnect from Outlook.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Save to localStorage
    localStorage.setItem('user_name', accountName);
    localStorage.setItem('user_timezone', timezone);
    localStorage.setItem('dark_mode', isDarkMode.toString());
    localStorage.setItem('show_emojis', showEmojis.toString());
    localStorage.setItem('compact_view', compactView.toString());
    
    // Simulate saving to the server
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "✅ Changes saved!",
        description: "Your account information has been updated successfully.",
      });
    }, 1000);
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
                <UserCog className="h-4 w-4 mr-2" /> Account 👤
              </TabsTrigger>
              <TabsTrigger value="connections">
                <ExternalLink className="h-4 w-4 mr-2" /> Connections 🔌
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" /> Notifications 🔔
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" /> Appearance 🎨
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information 👤</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences ✏️
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      disabled={outlookConnected}
                    />
                    {outlookConnected && (
                      <p className="text-xs text-email-text-muted mt-1">
                        ℹ️ Email is managed by your Outlook account
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="(UTC-08:00) Pacific Time">🌎 (UTC-08:00) Pacific Time</SelectItem>
                        <SelectItem value="(UTC-05:00) Eastern Time">🌎 (UTC-05:00) Eastern Time</SelectItem>
                        <SelectItem value="(UTC+00:00) GMT">🌍 (UTC+00:00) GMT</SelectItem>
                        <SelectItem value="(UTC+01:00) Central European Time">🌍 (UTC+01:00) Central European Time</SelectItem>
                        <SelectItem value="(UTC+08:00) China Standard Time">🌏 (UTC+08:00) China Standard Time</SelectItem>
                        <SelectItem value="(UTC+09:00) Japan Standard Time">🌏 (UTC+09:00) Japan Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Saving... 💾
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes 💾
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="connections">
              <Card>
                <CardHeader>
                  <CardTitle>Email Connections 🔗</CardTitle>
                  <CardDescription>
                    Connect to external email services to sync your messages 📨
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
                          {outlookConnected ? "Connected ✅" : "Connect to sync your Outlook emails and calendar 📅"}
                        </p>
                      </div>
                    </div>
                    {outlookConnected ? (
                      <Button variant="outline" className="flex items-center" onClick={handleDisconnectOutlook} disabled={isSaving}>
                        {isSaving ? (
                          "Disconnecting..."
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleConnectOutlook} disabled={isSaving}>
                        {isSaving ? "Connecting... ⏳" : "Connect 🔗"}
                      </Button>
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
                    <Button variant="outline">Connect 🔗</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-yellow-100 rounded-md flex items-center justify-center mr-4">
                        <Mail className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Yahoo Mail 📫</h3>
                        <p className="text-sm text-email-text-muted">
                          Connect to sync your Yahoo Mail account
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect 🔗</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings 🔔</CardTitle>
                  <CardDescription>
                    Customize how and when you receive notifications 📳
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications 📧</h3>
                      <p className="text-sm text-email-text-muted">
                        Receive notifications for new emails
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Desktop Notifications 🖥️</h3>
                      <p className="text-sm text-email-text-muted">
                        Show notifications on your desktop
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Sound Alerts 🔊</h3>
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
                    Customize the look and feel of the application ✨
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
                    <Switch 
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Emojis 😊</h3>
                      <p className="text-sm text-email-text-muted">
                        Display emojis in the interface
                      </p>
                    </div>
                    <Switch 
                      checked={showEmojis}
                      onCheckedChange={setShowEmojis}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Compact View 📑</h3>
                      <p className="text-sm text-email-text-muted">
                        Show more emails in the inbox view
                      </p>
                    </div>
                    <Switch 
                      checked={compactView}
                      onCheckedChange={setCompactView}
                    />
                  </div>
                  <Separator />
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Saving... 💾
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Appearance Settings 🎨
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
