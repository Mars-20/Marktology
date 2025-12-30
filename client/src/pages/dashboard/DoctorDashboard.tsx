import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Activity, Clock, ArrowUpRight } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-yellow-100 text-yellow-700",
    "bg-red-100 text-red-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function DoctorDashboard() {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const user = userData?.user;
  const clinicId = user?.clinic_id || '';
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['clinic-stats', clinicId],
    queryFn: () => api.clinics.stats(clinicId),
    enabled: !!clinicId,
  });

  const today = format(startOfToday(), 'yyyy-MM-dd');
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments(clinicId, { date: today });
  const { data: patientsData, isLoading: patientsLoading } = usePatients(clinicId, { status: 'active' });

  if (userLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const todayAppointments = appointmentsData?.appointments || [];
  const patients = patientsData?.patients || [];
  const recentPatients = patients.slice(0, 4);
  const remainingAppointments = todayAppointments.filter((a) => a.status !== 'completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your clinic's performance today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered patients
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{todayAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {remainingAppointments} remaining
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Staff members
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Today's Appointments */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>You have {remainingAppointments} appointments remaining today.</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <LoadingSpinner />
              ) : todayAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for today</p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="text-xs font-bold uppercase">{format(new Date(apt.appointment_date), "MMM")}</span>
                          <span className="text-lg font-bold">{format(new Date(apt.appointment_date), "dd")}</span>
                        </div>
                        <div>
                          <p className="font-medium">Patient {apt.patient_id.substring(0, 8)}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {apt.appointment_time} &middot; {apt.duration}min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === "in_progress" && (
                           <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
                        )}
                        {apt.status === "completed" && (
                           <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>
                        )}
                        {apt.status === "scheduled" && (
                           <Button size="sm" variant="outline">Start</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions / Recent Patients */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Quick access to patient files.</CardDescription>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <LoadingSpinner />
              ) : recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No patients yet</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {recentPatients.map((patient) => (
                      <Link key={patient.id} href={`/patients/${patient.id}`}>
                        <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(patient.full_name)}`}>
                              {patient.full_name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground">{patient.phone}</p>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/patients">
                      <Button className="w-full" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        View All Patients
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
