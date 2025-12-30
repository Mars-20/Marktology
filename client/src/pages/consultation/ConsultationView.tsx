import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Printer, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePatient } from "@/hooks/usePatients";
import { useCreateConsultation } from "@/hooks/useConsultations";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function ConsultationView() {
  const [, setLocation] = useLocation();
  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const { toast } = useToast();
  
  // Get patient ID from query params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId') || '';
  
  const { data: patientData, isLoading } = usePatient(patientId);
  const createConsultation = useCreateConsultation();
  
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const [formData, setFormData] = useState({
    chief_complaint: "",
    symptoms: "",
    diagnosis: "",
    treatment_plan: "",
    notes: "",
    vital_signs: {
      blood_pressure: "",
      heart_rate: "",
      temperature: "",
      weight: "",
    },
    prescriptions: [] as any[],
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (!patientData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Patient not found</div>
      </DashboardLayout>
    );
  }

  const patient = patientData.patient;

  const handleSave = async () => {
    try {
      await createConsultation.mutateAsync({
        patient_id: patient.id,
        ...formData,
        chief_complaint: formData.chief_complaint,
        examination: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment_plan,
        prescription: formData.prescriptions.length > 0 ? formData.prescriptions : null,
        notes: formData.notes,
      });
      toast({
        title: "Success",
        description: "Consultation saved successfully",
      });
      setShowFinishDialog(false);
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save consultation",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Link href={`/patients/${patient.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold tracking-tight">New Consultation</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{patient.full_name}</span>
                <span>&middot;</span>
                <span>{patient.gender}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/patients/${patient.id}`}>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
            
            <Button onClick={() => setShowFinishDialog(true)} disabled={createConsultation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createConsultation.isPending ? "Saving..." : "Finish & Save"}
            </Button>
          </div>
        </div>

        <div className="grid h-full grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Left Column: Vitals & Notes */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Vitals</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Blood Pressure</Label>
                  <Input
                    placeholder="120/80"
                    value={formData.vital_signs.blood_pressure}
                    onChange={(e) => setFormData({
                      ...formData,
                      vital_signs: { ...formData.vital_signs, blood_pressure: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Heart Rate</Label>
                  <Input
                    placeholder="72"
                    value={formData.vital_signs.heart_rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      vital_signs: { ...formData.vital_signs, heart_rate: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Temp (C)</Label>
                  <Input
                    placeholder="36.6"
                    value={formData.vital_signs.temperature}
                    onChange={(e) => setFormData({
                      ...formData,
                      vital_signs: { ...formData.vital_signs, temperature: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                  <Input
                    placeholder="75"
                    value={formData.vital_signs.weight}
                    onChange={(e) => setFormData({
                      ...formData,
                      vital_signs: { ...formData.vital_signs, weight: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[150px] resize-none border-0 p-0 focus-visible:ring-0" 
                  placeholder="Patient complains of..."
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Column: Diagnosis & Rx */}
          <div className="md:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter diagnosis..."
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Treatment Plan & Prescription</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPrintDialog(true)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Rx
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-3">
                    <Label>Treatment Plan</Label>
                    <Textarea
                      placeholder="Treatment plan and medications..."
                      value={formData.treatment_plan}
                      onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                    />
                 </div>

                 <div className="space-y-3">
                    <Label>Notes / Instructions</Label>
                    <Textarea
                      placeholder="Rest, drink fluids..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Finish Consultation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>Finish Consultation</DialogTitle>
             <DialogDescription>
               Are you sure you want to finalize this visit? This will save the record and update the patient's history.
             </DialogDescription>
           </DialogHeader>
           <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
             <div className="flex justify-between">
               <span className="text-muted-foreground">Patient:</span>
               <span className="font-medium">{patient.full_name}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Diagnosis:</span>
               <span className="font-medium">{formData.diagnosis || "Not specified"}</span>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Cancel</Button>
             <Button onClick={handleSave} disabled={createConsultation.isPending}>
               {createConsultation.isPending ? "Saving..." : "Confirm & Save"}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Preview Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
         <DialogContent className="max-w-[600px]">
           <div className="border p-8 bg-white text-black space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <div>
                   <h1 className="text-xl font-bold">Marktology OS</h1>
                   <p className="text-sm text-gray-500">{user?.full_name}</p>
                 </div>
                 <div className="text-right text-sm">
                   <p>Date: {new Date().toLocaleDateString()}</p>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <h3 className="font-bold border-b w-full pb-1 mb-2">Patient Details</h3>
                 <p>Name: {patient.full_name}</p>
                 <p>Gender: {patient.gender}</p>
              </div>

              <div className="space-y-4 min-h-[200px]">
                 <h3 className="font-bold text-xl">Prescription</h3>
                 <div className="ml-4">
                    <p className="font-bold">Diagnosis: {formData.diagnosis}</p>
                    <p className="text-sm mt-2">{formData.treatment_plan}</p>
                 </div>
              </div>

               <div className="pt-8 border-t flex justify-between items-end">
                 <div className="text-xs text-gray-400">
                   Generated by Marktology OS
                 </div>
                 <div className="border-t border-black w-40 text-center pt-1">
                   Doctor's Signature
                 </div>
               </div>
           </div>
           <DialogFooter>
             <Button onClick={() => window.print()}>Print Now</Button>
           </DialogFooter>
         </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
