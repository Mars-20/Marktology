import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle, CheckCircle2, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface FollowUpTask {
  id: string;
  patient_id: string;
  doctor_id: string;
  due_date: string;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  patient: {
    full_name: string;
    phone: string;
  };
  doctor: {
    full_name: string;
  };
}

export default function FollowUpList() {
  const [activeTab, setActiveTab] = useState<"pending" | "overdue" | "completed">("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get clinic_id from user context (you'll need to implement this)
  const clinicId = "your-clinic-id"; // Replace with actual clinic ID from context

  // Fetch follow-up tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/follow-up-tasks", clinicId, activeTab],
    queryFn: async () => {
      const isCompleted = activeTab === "completed";
      const response = await fetch(
        `/api/follow-up-tasks?clinic_id=${clinicId}&is_completed=${isCompleted}`
      );
      if (!response.ok) throw new Error("Failed to fetch follow-up tasks");
      const data = await response.json();
      return data.tasks as FollowUpTask[];
    },
  });

  // Complete follow-up mutation
  const completeTask = useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const response = await fetch(`/api/follow-up-tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error("Failed to complete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-up-tasks"] });
      toast({
        title: "تم إكمال المتابعة",
        description: "تم تسجيل المتابعة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إكمال المتابعة",
        variant: "destructive",
      });
    },
  });

  const getTaskStatus = (task: FollowUpTask) => {
    if (task.is_completed) return "completed";
    const daysUntilDue = differenceInDays(new Date(task.due_date), new Date());
    if (daysUntilDue < 0) return "overdue";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            متأخر
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            مكتمل
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            معلق
          </Badge>
        );
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    const status = getTaskStatus(task);
    if (activeTab === "overdue") return status === "overdue";
    if (activeTab === "completed") return status === "completed";
    return status === "pending";
  });

  const handleCompleteTask = (taskId: string) => {
    const notes = prompt("ملاحظات المتابعة (اختياري):");
    completeTask.mutate({ taskId, notes: notes || undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">متابعة المرضى</h1>
          <p className="text-muted-foreground">إدارة مواعيد المتابعة والتذكيرات</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            المعلقة ({filteredTasks?.filter((t) => getTaskStatus(t) === "pending").length || 0})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            المتأخرة ({filteredTasks?.filter((t) => getTaskStatus(t) === "overdue").length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            المكتملة ({filteredTasks?.filter((t) => getTaskStatus(t) === "completed").length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredTasks?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد متابعات في هذه الفئة</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks?.map((task) => {
              const status = getTaskStatus(task);
              const daysUntilDue = differenceInDays(new Date(task.due_date), new Date());

              return (
                <Card key={task.id} className={status === "overdue" ? "border-red-500" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {task.patient.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{task.title}</p>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(task.due_date), "dd MMMM yyyy", { locale: ar })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {daysUntilDue === 0
                            ? "اليوم"
                            : daysUntilDue > 0
                            ? `بعد ${daysUntilDue} يوم`
                            : `متأخر ${Math.abs(daysUntilDue)} يوم`}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>الطبيب:</span>
                      <span className="font-medium">{task.doctor.full_name}</span>
                    </div>

                    {!task.is_completed && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completeTask.isPending}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                          إكمال المتابعة
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <User className="h-4 w-4 ml-2" />
                          عرض ملف المريض
                        </Button>
                      </div>
                    )}

                    {task.is_completed && task.completed_at && (
                      <div className="text-sm text-muted-foreground">
                        تم الإكمال في:{" "}
                        {format(new Date(task.completed_at), "dd MMMM yyyy - HH:mm", {
                          locale: ar,
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
