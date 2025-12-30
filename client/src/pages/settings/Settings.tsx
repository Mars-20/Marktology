import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2 } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage clinic details, staff access, and system preferences.</p>
        </div>

        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
            <TabsTrigger value="clinic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Clinic Profile</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Staff Management</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
                <CardDescription>Visible on patient reports and invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input id="clinic-name" defaultValue="Marktology Clinics" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Primary Specialty</Label>
                    <Input id="specialty" defaultValue="General Practice" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Medical Park, Cairo, Egypt" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" defaultValue="+20 123 456 7890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" defaultValue="contact@marktology.com" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle>Staff Members</CardTitle>
                   <CardDescription>Manage doctors, nurses, and receptionists.</CardDescription>
                </div>
                <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Add Staff</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { name: "Dr. Sarah Smith", role: "Doctor (Admin)", email: "sarah@marktology.com" },
                   { name: "Nurse John", role: "Nurse", email: "john@marktology.com" },
                   { name: "Mona Reception", role: "Receptionist", email: "mona@marktology.com" },
                 ].map((staff, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{staff.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.role} &middot; {staff.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                 ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summaries via email.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                    <Label className="text-base">SMS Reminders for Patients</Label>
                    <p className="text-sm text-muted-foreground">Automatically send appointment reminders.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                    <Label className="text-base">Follow-up Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify me when a patient is due for a checkup.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
