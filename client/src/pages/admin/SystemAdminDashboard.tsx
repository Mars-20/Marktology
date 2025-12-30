import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShieldCheck, LogOut, Building2, Users, Activity, ExternalLink } from "lucide-react";
import logoUrl from "@assets/marktology-logo.png";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState } from "react";

export default function SystemAdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: api.admin.clinics,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.admin.stats,
  });

  const clinics = clinicsData?.clinics || [];
  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <img src={logoUrl} alt="Marktology OS Logo" className="h-8 w-8 rounded-md object-cover" />
          <span>Marktology OS <span className="text-xs font-normal text-muted-foreground ml-1 bg-muted px-2 py-0.5 rounded-full">SYSTEM ADMIN</span></span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden md:block">
            Logged in as <span className="font-medium text-foreground">Super Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
            <p className="text-muted-foreground">Manage all registered clinics and monitor system health.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/manage-clinics">
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Clinics
              </Button>
            </Link>
            <Link href="/register-clinic">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Register New Clinic
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_clinics || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats?.active_clinics || 0} active</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all clinics</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime last 30 days</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">Platform-wide</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clinics List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registered Clinics</CardTitle>
                <CardDescription>Directory of all medical facilities using Marktology OS.</CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search clinics..." 
                   className="pl-8" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clinicsLoading ? (
              <LoadingSpinner />
            ) : filteredClinics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No clinics found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-mono text-xs font-medium">{clinic.id}</TableCell>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>{clinic.specialty || 'General'}</TableCell>
                      <TableCell>{clinic.stats?.total_patients || 0}</TableCell>
                      <TableCell>
                        <Badge variant={clinic.status === 'active' ? "default" : "secondary"}>
                          {clinic.status === 'active' ? 'Active' : clinic.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/admin/manage-clinics">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
