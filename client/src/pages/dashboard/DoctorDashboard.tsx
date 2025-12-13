import { MOCK_STATS, MOCK_APPOINTMENTS, MOCK_PATIENTS } from "@/lib/mockData";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Activity, Clock, ArrowUpRight, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your clinic's performance today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MOCK_STATS.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {i === 0 && <Users className="h-4 w-4 text-muted-foreground" />}
                {i === 1 && <Calendar className="h-4 w-4 text-muted-foreground" />}
                {i === 2 && <Clock className="h-4 w-4 text-muted-foreground" />}
                {i === 3 && <Activity className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : ""}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Today's Appointments */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>You have {MOCK_APPOINTMENTS.filter(a => a.status !== 'Completed').length} appointments remaining today.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-xs font-bold uppercase">{format(apt.date, "MMM")}</span>
                        <span className="text-lg font-bold">{format(apt.date, "dd")}</span>
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {apt.time} &middot; {apt.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.status === "In-Progress" && (
                         <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
                      )}
                      {apt.status === "Completed" && (
                         <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>
                      )}
                      {apt.status === "Scheduled" && (
                         <Button size="sm" variant="outline">Start</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Recent Patients */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Quick access to patient files.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_PATIENTS.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${patient.avatarColor}`}>
                        {patient.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.condition}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View All Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
