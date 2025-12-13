import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Building2 } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctor">Doctor/Staff</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Owner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="doctor">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <Input id="email" type="email" placeholder="dr.sarah@smartcare.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                    <Input id="password" type="password" required />
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
                <CardDescription>Manage your clinic subscription and settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-id">Clinic ID</Label>
                  <Input id="clinic-id" placeholder="CL-12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-pass">Admin Password</Label>
                  <Input id="clinic-pass" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" variant="outline">Login as Admin</Button>
                <div className="text-center text-sm text-muted-foreground">
                  New clinic? <Link href="/register-clinic"><a className="text-primary hover:underline">Register here</a></Link>
                </div>
              </CardFooter>
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
