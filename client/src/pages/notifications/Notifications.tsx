import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertCircle, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { useCurrentUser } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => api.notifications.list(user?.id || ''),
    enabled: !!user?.id,
  });

  const notifications = notificationsData?.notifications || [];

  const markAllRead = useMutation({
    mutationFn: () => api.notifications.markAllRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with patient alerts and system messages.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No notifications
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                    notification.type === 'appointment' ? 'bg-blue-100 text-blue-700' :
                    notification.type === 'referral' ? 'bg-amber-100 text-amber-700' :
                    notification.type === 'follow_up' ? 'bg-destructive/10 text-destructive' :
                    notification.type === 'alert' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {notification.type === 'appointment' && <Calendar className="h-4 w-4" />}
                    {notification.type === 'referral' && <Bell className="h-4 w-4" />}
                    {notification.type === 'follow_up' && <Clock className="h-4 w-4" />}
                    {notification.type === 'alert' && <AlertCircle className="h-4 w-4" />}
                    {notification.type === 'system' && <AlertCircle className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
