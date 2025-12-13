import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShieldCheck, LogOut, Building2, Users, Activity, ExternalLink } from "lucide-react";
import logoUrl from "@assets/generated_images/minimalist_medical_cross_logo_with_clean_lines.png";

const MOCK_CLINICS = [
  { id: "CL-8392", name: "Cairo Medical Center", owner: "Dr. Ahmed Ali", specialty: "General", status: "Active", patients: 1240, plan: "Pro" },
  { id: "CL-1120", name: "Al-Amal Dental", owner: "Dr. Mona Zaki", specialty: "Dental", status: "Active", patients: 850, plan: "Basic" },
  { id: "CL-4501", name: "Kids Care Clinic", owner: "Dr. Sarah Smith", specialty: "Pediatrics", status: "Pending", patients: 0, plan: "Trial" },
];

export default function SystemAdminDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-muted/20 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <img src={logoUrl} alt="SmartCare Logo" className="h-8 w-8 rounded-md object-cover" />
          <span>SmartCare <span className="text-xs font-normal text-muted-foreground ml-1 bg-muted px-2 py-0.5 rounded-full">SYSTEM ADMIN</span></span>
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
          <Link href="/register-clinic">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Register New Clinic
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+4 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,543</div>
              <p className="text-xs text-muted-foreground">Across all clinics</p>
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
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45.2k</div>
              <p className="text-xs text-muted-foreground">Monthly Recurring</p>
            </CardContent>
          </Card>
        </div>

        {/* Clinics List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registered Clinics</CardTitle>
                <CardDescription>Directory of all medical facilities using SmartCare.</CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Search clinics..." className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CLINICS.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-mono text-xs font-medium">{clinic.id}</TableCell>
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>{clinic.owner}</TableCell>
                    <TableCell>{clinic.specialty}</TableCell>
                    <TableCell><Badge variant="outline">{clinic.plan}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={clinic.status === "Active" ? "default" : "secondary"}>
                        {clinic.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Access
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
