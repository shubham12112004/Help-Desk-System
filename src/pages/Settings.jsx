import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Monitor,
  Shield,
  Eye,
  Download,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getUserSettings,
  updateUserSettings,
  updateUserProfile,
  updateUserPassword,
  exportUserData,
  deactivateUserAccount,
} from "@/services/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load settings
      const settingsData = await getUserSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await updateUserProfile(profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      setSaving(true);
      await updateUserSettings(settings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await updateUserPassword(passwordData.newPassword);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "User data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      setSaving(true);
      await deactivateUserAccount();
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display">
              <Monitor className="h-4 w-4 mr-2" />
              Display
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Eye className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile?.full_name || ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ""} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile?.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile?.department || ""}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile?.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={profile?.emergency_contact || ""}
                    onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                  />
                </div>

                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Notification Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <Switch
                        id="email_notifications"
                        checked={settings?.email_notifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, email_notifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push_notifications">Push Notifications</Label>
                      <Switch
                        id="push_notifications"
                        checked={settings?.push_notifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, push_notifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms_notifications">SMS Notifications</Label>
                      <Switch
                        id="sms_notifications"
                        checked={settings?.sms_notifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, sms_notifications: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_ticket_created">Ticket Created</Label>
                      <Switch
                        id="notify_ticket_created"
                        checked={settings?.notify_ticket_created}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_ticket_created: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_ticket_assigned">Ticket Assigned</Label>
                      <Switch
                        id="notify_ticket_assigned"
                        checked={settings?.notify_ticket_assigned}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_ticket_assigned: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_ticket_updated">Ticket Updated</Label>
                      <Switch
                        id="notify_ticket_updated"
                        checked={settings?.notify_ticket_updated}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_ticket_updated: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_ticket_commented">New Comments</Label>
                      <Switch
                        id="notify_ticket_commented"
                        checked={settings?.notify_ticket_commented}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_ticket_commented: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_appointment_reminder">Appointment Reminders</Label>
                      <Switch
                        id="notify_appointment_reminder"
                        checked={settings?.notify_appointment_reminder}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_appointment_reminder: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_sla_warning">SLA Warnings</Label>
                      <Switch
                        id="notify_sla_warning"
                        checked={settings?.notify_sla_warning}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, notify_sla_warning: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Email Digests</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily_digest">Daily Digest</Label>
                      <Switch
                        id="daily_digest"
                        checked={settings?.daily_digest}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, daily_digest: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekly_summary">Weekly Summary</Label>
                      <Switch
                        id="weekly_summary"
                        checked={settings?.weekly_summary}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, weekly_summary: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize your interface appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings?.theme}
                    onValueChange={(value) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings?.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select
                    value={settings?.date_format}
                    onValueChange={(value) => setSettings({ ...settings, date_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_format">Time Format</Label>
                  <Select
                    value={settings?.time_format}
                    onValueChange={(value) => setSettings({ ...settings, time_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_dashboard_view">Default Dashboard View</Label>
                  <Select
                    value={settings?.default_dashboard_view}
                    onValueChange={(value) => setSettings({ ...settings, default_dashboard_view: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tickets_per_page">Tickets Per Page</Label>
                  <Select
                    value={settings?.tickets_per_page?.toString()}
                    onValueChange={(value) => setSettings({ ...settings, tickets_per_page: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_sound">Enable Sound</Label>
                  <Switch
                    id="enable_sound"
                    checked={settings?.enable_sound}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_sound: checked })}
                  />
                </div>

                <Button onClick={handleSettingsUpdate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button onClick={handlePasswordUpdate} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Password
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Account Information</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Account ID: {user?.id}</p>
                    <p>Email: {profile?.email}</p>
                    <p>Role: {profile?.role}</p>
                    <p>Account Created: {new Date(profile?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>Manage your privacy and data settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile_visible">Profile Visible to Others</Label>
                      <Switch
                        id="profile_visible"
                        checked={settings?.profile_visible}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, profile_visible: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_online_status">Show Online Status</Label>
                      <Switch
                        id="show_online_status"
                        checked={settings?.show_online_status}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, show_online_status: checked })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleSettingsUpdate} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Data Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your data or delete your account
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleExportData} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Export Data
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deactivate Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will deactivate your account. You can contact support to reactivate it later.
                            Your data will be preserved but your account will be inaccessible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeactivateAccount}>
                            Deactivate Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
