import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logoUrl from "@assets/marktology-logo.png";
import { useToast } from "@/hooks/use-toast";

interface RegistrationData {
  name: string;
  address: string;
  phone: string;
  email: string;
  specialty: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  owner_specialization: string;
}

export default function RegisterClinic() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    specialty: '',
    owner_first_name: '',
    owner_last_name: '',
    owner_email: '',
    owner_phone: '',
    owner_specialization: '',
  });
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await fetch('/api/register-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setRegistrationResult(data.data);
      setStep(3);
      toast({
        title: "تم التسجيل بنجاح!",
        description: "تم إنشاء العيادة بنجاح. في انتظار موافقة المسؤول.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل التسجيل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ!",
      description: `تم نسخ ${label} إلى الحافظة`,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-xl bg-primary/10 p-4 mb-4">
             <img src={logoUrl} alt="Marktology OS Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">تسجيل عيادة جديدة</h1>
          <p className="text-muted-foreground mt-2">انضم إلى Marktology OS وأدر عيادتك بكفاءة</p>
        </div>

        {step === 1 && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle>معلومات العيادة</CardTitle>
              <CardDescription>أدخل المعلومات الأساسية للعيادة الجديدة</CardDescription>
            </CardHeader>
            <form onSubmit={handleStep1Submit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">اسم العيادة *</Label>
                  <Input 
                    id="clinic-name" 
                    placeholder="مثال: مركز القاهرة الطبي" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">التخصص الرئيسي *</Label>
                  <Input 
                    id="specialty" 
                    placeholder="مثال: عام، قلب، أسنان" 
                    required 
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان *</Label>
                  <Input 
                    id="address" 
                    placeholder="العنوان الكامل" 
                    required 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+20 123 456 7890" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="clinic@example.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">متابعة</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>معلومات المسؤول</CardTitle>
              <CardDescription>إعداد حساب المسؤول الرئيسي</CardDescription>
            </CardHeader>
            <form onSubmit={handleStep2Submit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="first-name">الاسم الأول *</Label>
                    <Input 
                      id="first-name" 
                      required 
                      value={formData.owner_first_name}
                      onChange={(e) => setFormData({ ...formData, owner_first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">اسم العائلة *</Label>
                    <Input 
                      id="last-name" 
                      required 
                      value={formData.owner_last_name}
                      onChange={(e) => setFormData({ ...formData, owner_last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-email">البريد الإلكتروني *</Label>
                  <Input 
                    id="owner-email" 
                    type="email" 
                    placeholder="admin@clinic.com" 
                    required 
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-phone">رقم الهاتف *</Label>
                  <Input 
                    id="owner-phone" 
                    placeholder="+20 123 456 7890" 
                    required 
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-specialization">التخصص (اختياري)</Label>
                  <Input 
                    id="owner-specialization" 
                    placeholder="مثال: طب عام" 
                    value={formData.owner_specialization}
                    onChange={(e) => setFormData({ ...formData, owner_specialization: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>رجوع</Button>
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    'إكمال التسجيل'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 3 && registrationResult && (
          <Card className="border-none shadow-lg animate-in zoom-in-95">
            <CardContent className="pt-6 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="text-center">
                <CardTitle className="text-xl">تم التسجيل بنجاح!</CardTitle>
                <CardDescription className="mt-2">
                  تم إضافة العيادة إلى النظام. يرجى حفظ المعلومات التالية للدخول:
                </CardDescription>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  العيادة في انتظار موافقة المسؤول. سيتم إخطارك عند التفعيل.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">كود العيادة</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold text-primary">{registrationResult.clinic.code}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(registrationResult.clinic.code, 'كود العيادة')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">اسم المستخدم</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold">{registrationResult.owner.username}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(registrationResult.owner.username, 'اسم المستخدم')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">كلمة المرور المؤقتة</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold">{registrationResult.owner.temporary_password}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(registrationResult.owner.temporary_password, 'كلمة المرور')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">رقم الترخيص</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{registrationResult.clinic.license_number}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(registrationResult.clinic.license_number, 'رقم الترخيص')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>مهم:</strong> احفظ هذه المعلومات في مكان آمن. ستحتاجها للدخول إلى النظام.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => setLocation("/")}>الذهاب لتسجيل الدخول</Button>
                <Button variant="ghost" className="w-full" onClick={() => {
                  setStep(1);
                  setFormData({
                    name: '',
                    address: '',
                    phone: '',
                    email: '',
                    specialty: '',
                    owner_first_name: '',
                    owner_last_name: '',
                    owner_email: '',
                    owner_phone: '',
                    owner_specialization: '',
                  });
                  setRegistrationResult(null);
                }}>تسجيل عيادة أخرى</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/"><a className="text-primary hover:underline">العودة لتسجيل الدخول</a></Link>
        </div>
      </div>
    </div>
  );
}
