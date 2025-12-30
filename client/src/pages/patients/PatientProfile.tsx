import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail, MapPin, Edit, Stethoscope, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useState } from "react";
import { format, differenceInYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

export default function PatientProfile() {
  const [, params] = useRoute("/patients/:id");
  const id = params?.id || '';
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: patientData, isLoading, error } = usePatient(id);
  const updatePatient = useUpdatePatient();

  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error || !patientData) {
    return (
      <DashboardLayout>
        <ErrorMessage error={error || new Error("Patient not found")} />
      </DashboardLayout>
    );
  }

  const patient = patientData.patient;
  const recentAppointments = patientData.recent_appointments || [];
  const recentConsultations = patientData.recent_consultations || [];
  const age = differenceInYears(new Date(), new Date(patient.date_of_birth));

  const handleEditClick = () => {
    setEditFormData({
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email || "",
      address: patient.address,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePatient.mutateAsync({
        id: patient.id,
        data: editFormData,
      });
      toast({
        title: "Success",
        description: "Patient profile updated successfully",
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{patient.full_name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">ID: {patient.file_number}</Badge>
              <span>&middot;</span>
              <span>{age} Years, {patient.gender}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
               <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleEditClick}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
               </DialogTrigger>
               <DialogContent>
                 <form onSubmit={handleEditSubmit}>
                   <DialogHeader>
                     <DialogTitle>Edit Patient Profile</DialogTitle>
                     <DialogDescription>Update personal information.</DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                       <Label>Full Name</Label>
                       <Input
                         value={editFormData.full_name}
                         onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                       />
                     </div>
                     <div className="grid gap-2">
                       <Label>Phone</Label>
                       <Input
                         value={editFormData.phone}
                         onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                       />
                     </div>
                     <div className="grid gap-2">
                       <Label>Email</Label>
                       <Input
                         type="email"
                         value={editFormData.email}
                         onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                       />
                     </div>
                     <div className="grid gap-2">
                       <Label>Address</Label>
                       <Input
                         value={editFormData.address}
                         onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                       />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button type="submit" disabled={updatePatient.isPending}>
                       {updatePatient.isPending ? "Saving..." : "Save Changes"}
                     </Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Refer Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Refer Patient</DialogTitle>
                  <DialogDescription>Send this patient's summary to another specialist.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Referred To</Label>
                    <Input placeholder="Specialist name or clinic" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Referral Reason</Label>
                    <Textarea placeholder="Reason for referral..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Send Referral</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link href={`/consultations/new?patientId=${patient.id}`}>
              <Button>
                <Stethoscope className="mr-2 h-4 w-4" />
                Start Consultation
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Sidebar Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                 <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold mb-4 ${getAvatarColor(patient.full_name)}`}>
                    {patient.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg">{patient.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <div className="mt-4 flex justify-center">
                    <Badge variant="default">
                        Active
                    </Badge>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.address}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Not specified</p>
                  <p className="text-muted-foreground">-</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Medical History</TabsTrigger>
                <TabsTrigger value="visits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Visits & Consultations</TabsTrigger>
                <TabsTrigger value="appointments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Appointments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{format(new Date(patient.date_of_birth), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Type</p>
                        <p className="font-medium">{patient.blood_type || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No additional medical information recorded</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits" className="mt-6">
                <div className="space-y-4">
                  {recentConsultations.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No consultations recorded yet
                      </CardContent>
                    </Card>
                  ) : (
                    recentConsultations.map((consultation: any) => (
                      <Card key={consultation.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">Consultation</CardTitle>
                              <CardDescription>
                                {format(new Date(consultation.created_at), "MMM dd, yyyy 'at' h:mm a")}
                              </CardDescription>
                            </div>
                            <Link href={`/consultations/${consultation.id}`}>
                              <Button variant="ghost" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Chief Complaint:</p>
                              <p className="text-sm text-muted-foreground">{consultation.chief_complaint}</p>
                            </div>
                            {consultation.diagnosis && (
                              <div>
                                <p className="text-sm font-medium">Diagnosis:</p>
                                <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="appointments" className="mt-6">
                <div className="space-y-4">
                  {recentAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No appointments scheduled
                      </CardContent>
                    </Card>
                  ) : (
                    recentAppointments.map((appointment: any) => (
                      <Card key={appointment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{appointment.type}</CardTitle>
                              <CardDescription>
                                {format(new Date(appointment.appointment_date), "MMM dd, yyyy")} at {appointment.appointment_time}
                              </CardDescription>
                            </div>
                            <Badge variant={
                              appointment.status === "completed" ? "secondary" :
                              appointment.status === "in_progress" ? "default" :
                              "outline"
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        {appointment.notes && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
