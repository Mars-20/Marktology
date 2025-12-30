import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/FileUpload";
import { 
  User, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Activity,
  Pill,
  AlertCircle,
  MessageSquare,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PatientFullProfile {
  patient: any;
  recent_consultations: any[];
  upcoming_appointments: any[];
  pending_follow_ups: any[];
  recent_files: any[];
  communication_history: any[];
}

export default function PatientProfileEnhanced() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch full patient profile
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/patients/${id}/full-profile`],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${id}/full-profile`);
      if (!response.ok) throw new Error("Failed to fetch patient profile");
      return response.json() as Promise<PatientFullProfile>;
    },
  });

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

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لم يتم العثور على المريض</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { patient, recent_consultations, upcoming_appointments, pending_follow_ups, recent_files, communication_history } = profile;

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{patient.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">رقم الملف: {patient.file_number}</p>
              </div>
            </div>
            <Badge variant="secondary">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">تاريخ الميلاد</p>
                <p className="text-sm font-medium">
                  {format(new Date(patient.date_of_birth), "dd MMMM yyyy", { locale: ar })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="text-sm font-medium">{patient.phone}</p>
              </div>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                  <p className="text-sm font-medium">{patient.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">العنوان</p>
                <p className="text-sm font-medium">{patient.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="medical-history">السجل الطبي</TabsTrigger>
          <TabsTrigger value="consultations">الاستشارات</TabsTrigger>
          <TabsTrigger value="files">الملفات</TabsTrigger>
          <TabsTrigger value="communications">الاتصالات</TabsTrigger>
          <TabsTrigger value="follow-ups">المتابعات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">المواعيد القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{upcoming_appointments.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">المتابعات المعلقة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pending_follow_ups.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">إجمالي الاستشارات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{recent_consultations.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recent_consultations.slice(0, 3).map((consultation: any) => (
                <div key={consultation.consultation.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">استشارة طبية</p>
                    <p className="text-sm text-muted-foreground">
                      {consultation.doctor.full_name} - {consultation.doctor.specialization}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(consultation.consultation.consultation_date), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                الأمراض المزمنة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.chronic_diseases && Array.isArray(patient.chronic_diseases) && patient.chronic_diseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.chronic_diseases.map((disease: string, index: number) => (
                    <Badge key={index} variant="secondary">{disease}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد أمراض مزمنة مسجلة</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                الحساسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy: string, index: number) => (
                    <Badge key={index} variant="destructive">{allergy}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد حساسية مسجلة</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                الأدوية الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.current_medications && Array.isArray(patient.current_medications) && patient.current_medications.length > 0 ? (
                <div className="space-y-2">
                  {patient.current_medications.map((medication: any, index: number) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="font-medium">{medication.name || medication}</p>
                      {medication.dosage && <p className="text-sm text-muted-foreground">الجرعة: {medication.dosage}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد أدوية حالية مسجلة</p>
              )}
            </CardContent>
          </Card>

          {patient.medical_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ملاحظات طبية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{patient.medical_notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          {recent_consultations.map((consultation: any) => (
            <Card key={consultation.consultation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(new Date(consultation.consultation.consultation_date), "dd MMMM yyyy", { locale: ar })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      د. {consultation.doctor.full_name} - {consultation.doctor.specialization}
                    </p>
                  </div>
                  <Badge>{consultation.consultation.status === 'completed' ? 'مكتملة' : 'جارية'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">الشكوى الرئيسية:</p>
                  <p className="text-sm text-muted-foreground">{consultation.consultation.chief_complaint}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">التشخيص:</p>
                  <p className="text-sm text-muted-foreground">{consultation.consultation.diagnosis}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">العلاج:</p>
                  <p className="text-sm text-muted-foreground">{consultation.consultation.treatment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الملفات المرفقة</CardTitle>
                <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 ml-2" />
                  رفع ملف
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recent_files.length > 0 ? (
                <div className="space-y-2">
                  {recent_files.map((file: any) => (
                    <div key={file.file.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{file.file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(file.file.uploaded_at), "dd MMMM yyyy", { locale: ar })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">عرض</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد ملفات مرفقة</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سجل الاتصالات</CardTitle>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 ml-2" />
                  تسجيل اتصال
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {communication_history.length > 0 ? (
                <div className="space-y-4">
                  {communication_history.map((comm: any) => (
                    <div key={comm.log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{comm.log.subject || 'اتصال'}</p>
                          <Badge variant={comm.log.status === 'successful' ? 'default' : 'secondary'}>
                            {comm.log.status === 'successful' ? 'ناجح' : comm.log.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {comm.user.full_name} - {format(new Date(comm.log.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                        </p>
                        {comm.log.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{comm.log.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">لا يوجد سجل اتصالات</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="follow-ups" className="space-y-4">
          {pending_follow_ups.map((followUp: any) => (
            <Card key={followUp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{followUp.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(followUp.due_date), "dd MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <Badge variant={followUp.is_completed ? 'default' : 'secondary'}>
                    {followUp.is_completed ? 'مكتملة' : 'معلقة'}
                  </Badge>
                </div>
              </CardHeader>
              {followUp.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{followUp.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
          {pending_follow_ups.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد متابعات معلقة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* File Upload Dialog */}
      <FileUpload
        patientId={id!}
        clinicId={patient.clinic_id}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
