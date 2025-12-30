import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";
import logoUrl from "@assets/marktology-logo.png";
import { useLogin } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const handleError = useApiError();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      {
        onError: handleError,
      }
    );
  };

  if (login.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <LoadingSpinner text="Signing in..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-xl bg-primary/10 p-4 mb-4">
             <img src={logoUrl} alt="Marktology OS Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Marktology OS</h1>
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
                    <Input 
                      id="email" 
                      type="text" 
                      placeholder="dr.sarah@marktology.com" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="clinic">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Clinic Portal</CardTitle>
                <CardDescription>Login with your username or email provided during registration.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-id">Username or Email</Label>
                    <Input 
                      id="clinic-id" 
                      placeholder="ahmed.hassan or email@example.com" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the username (e.g., firstname.lastname) or email provided after registration
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-pass">Password</Label>
                    <Input 
                      id="clinic-pass" 
                      type="password" 
                      placeholder="Your password or temporary password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <p className="text-xs text-muted-foreground">
                      First time? Use the temporary password (Clinic@XXXX) provided during registration
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending ? "Verifying..." : "Login as Owner"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    New clinic? <a href="/register-clinic" className="text-primary hover:underline">Register here</a>
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
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sys-email">System Email</Label>
                    <Input 
                      id="sys-email" 
                      type="text" 
                      placeholder="admin@marktology-os.com" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sys-pass">Master Password</Label>
                    <Input 
                      id="sys-pass" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" variant="destructive" disabled={login.isPending}>
                    {login.isPending ? "Authenticating..." : "Access System Core"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground">
          &copy; 2025 Marktology OS. All rights reserved. <br/>
          <a href="#" className="hover:text-primary">Privacy Policy</a> &middot; <a href="#" className="hover:text-primary">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
