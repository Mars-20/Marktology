import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertCircle, CheckCheck, Clock } from "lucide-react";
import { format, subHours, subDays } from "date-fns";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "follow-up",
    title: "Follow-up Due: Ahmed Hassan",
    message: "Patient due for hypertension checkup. Last visit was 30 days ago.",
    time: subHours(new Date(), 2),
    priority: "high",
    read: false,
  },
  {
    id: 2,
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight at 2:00 AM. Expected downtime: 15 mins.",
    time: subDays(new Date(), 1),
    priority: "low",
    read: true,
  },
  {
    id: 3,
    type: "referral",
    title: "New Referral Received",
    message: "Dr. Mona Zaki referred Patient Layla Mahmoud for Cardiology consultation.",
    time: subHours(new Date(), 5),
    priority: "medium",
    read: false,
  },
  {
    id: 4,
    type: "lab",
    title: "Lab Results Ready",
    message: "Blood test results for Karim Samir are now available.",
    time: subDays(new Date(), 2),
    priority: "medium",
    read: true,
  }
];

export default function Notifications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with patient alerts and system messages.</p>
          </div>
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <div className="grid gap-4">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                  notification.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                  notification.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {notification.type === 'follow-up' && <Clock className="h-4 w-4" />}
                  {notification.type === 'system' && <AlertCircle className="h-4 w-4" />}
                  {notification.type === 'referral' && <Bell className="h-4 w-4" />}
                  {notification.type === 'lab' && <Calendar className="h-4 w-4" />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <span className="text-xs text-muted-foreground">{format(notification.time, "MMM d, h:mm a")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                
                {!notification.read && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="sr-only">Unread</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
