import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";
import logoUrl from "@assets/generated_images/minimalist_medical_cross_logo_with_clean_lines.png";
import { useToast } from "@/hooks/use-toast";

export default function RegisterClinic() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicId, setClinicId] = useState("");
  const { toast } = useToast();

  const generateClinicId = () => {
    return "CL-" + Math.floor(10000 + Math.random() * 90000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setClinicId(generateClinicId());
      setStep(3); // Success state
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(clinicId);
    toast({
      title: "Copied!",
      description: "Clinic ID copied to clipboard.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-xl bg-primary/10 p-4 mb-4">
             <img src={logoUrl} alt="SmartCare Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Register New Clinic</h1>
          <p className="text-muted-foreground mt-2">Join SmartCare and manage your practice efficiently.</p>
        </div>

        {step === 1 && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle>Clinic Details</CardTitle>
              <CardDescription>Enter the basic information for the new clinic.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input id="clinic-name" placeholder="Ex: Cairo Medical Center" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Primary Specialty</Label>
                  <Input id="specialty" placeholder="Ex: General, Cardiology, Dental" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Full address" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Continue</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>Admin & Access</CardTitle>
              <CardDescription>Set up the main administrator account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input id="email" type="email" placeholder="admin@clinic.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Clinic..." : "Complete Registration"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-lg animate-in zoom-in-95">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Clinic Registered Successfully!</CardTitle>
                <CardDescription className="mt-2">
                  The clinic has been added to the system. Please save the <strong>Clinic ID</strong> below for login.
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg border border-dashed">
                <code className="flex-1 text-lg font-mono font-bold text-primary tracking-wider">{clinicId}</code>
                <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => setLocation("/")}>Go to Login</Button>
                <Button variant="ghost" className="w-full" onClick={() => setLocation("/admin-dashboard")}>Back to System Admin</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/"><a className="text-primary hover:underline">Back to Login</a></Link>
        </div>
      </div>
    </div>
  );
}
