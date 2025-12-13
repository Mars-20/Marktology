import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Building2, ShieldCheck } from "lucide-react";
import logoUrl from "@assets/generated_images/minimalist_medical_cross_logo_with_clean_lines.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1000);
  };

  const handleSystemAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/admin-dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-xl bg-primary/10 p-4 mb-4">
             <img src={logoUrl} alt="SmartCare Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SmartCare Clinics</h1>
          <p className="text-muted-foreground mt-2">Manage your clinic with ease and precision.</p>
        </div>

        <Tabs defaultValue="doctor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctor">Doctor/Staff</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Owner</TabsTrigger>
            <TabsTrigger value="admin">Sys Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="doctor">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Staff Login</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <Input id="email" type="email" placeholder="dr.sarah@smartcare.com" defaultValue="dr.sarah@smartcare.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                    <Input id="password" type="password" defaultValue="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="clinic">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Clinic Portal</CardTitle>
                <CardDescription>Login with your Clinic ID.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-id">Clinic ID</Label>
                    <Input id="clinic-id" placeholder="CL-XXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-pass">Admin Password</Label>
                    <Input id="clinic-pass" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Login as Owner"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    New clinic? <Link href="/register-clinic"><a className="text-primary hover:underline">Register here</a></Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="border-none shadow-lg border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck className="h-5 w-5 text-primary" />
                   <span className="text-xs font-bold uppercase text-primary tracking-wider">System Admin</span>
                </div>
                <CardTitle>Platform Management</CardTitle>
                <CardDescription>Access the central administration panel.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSystemAdminLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sys-email">System Email</Label>
                    <Input id="sys-email" type="email" placeholder="admin@smartcare-sys.com" defaultValue="admin@smartcare-sys.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sys-pass">Master Password</Label>
                    <Input id="sys-pass" type="password" defaultValue="masterkey" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Access System Core"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground">
          &copy; 2024 SmartCare Systems. All rights reserved. <br/>
          <a href="#" className="hover:text-primary">Privacy Policy</a> &middot; <a href="#" className="hover:text-primary">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
