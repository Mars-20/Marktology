import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PATIENTS } from "@/lib/mockData";
import { ArrowLeft, Save, Printer, History, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ConsultationView() {
  const [, setLocation] = useLocation();
  const patient = MOCK_PATIENTS[0]; // Mocking the first patient
  const [activeTab, setActiveTab] = useState("consultation");
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Link href="/patients/P001">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold tracking-tight">New Consultation</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{patient.name}</span>
                <span>&middot;</span>
                <span>{patient.age}y {patient.gender}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            
            <Button onClick={() => setShowFinishDialog(true)}>
              <Save className="mr-2 h-4 w-4" />
              Finish & Save
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
                  <Input placeholder="120/80" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Heart Rate</Label>
                  <Input placeholder="72" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Temp (C)</Label>
                  <Input placeholder="36.6" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                  <Input placeholder="75" />
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
                <div className="flex gap-2">
                   <Input placeholder="Search ICD-10 codes or type diagnosis..." className="flex-1" />
                   <Button variant="secondary">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-sm flex gap-2 items-center">
                    Acute Bronchitis <span className="text-muted-foreground cursor-pointer hover:text-foreground">×</span>
                  </Badge>
                </div>
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
                    <Label>Medications</Label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                         <Input placeholder="Drug Name" />
                      </div>
                      <div className="col-span-3">
                         <Input placeholder="Dosage" />
                      </div>
                       <div className="col-span-3">
                         <Input placeholder="Frequency" />
                      </div>
                      <div className="col-span-1">
                        <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/20 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Augmentin 1g</span>
                        <span className="text-muted-foreground">1 tablet every 12 hours for 7 days</span>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label>Notes / Instructions</Label>
                    <Textarea placeholder="Rest, drink fluids..." />
                 </div>
                 
                 <div className="space-y-3 pt-4 border-t">
                    <Label>Follow Up</Label>
                    <div className="flex gap-4">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Week</SelectItem>
                          <SelectItem value="2">2 Weeks</SelectItem>
                          <SelectItem value="4">1 Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" id="reminder" className="rounded border-gray-300" defaultChecked />
                        <label htmlFor="reminder">Send SMS Reminder</label>
                      </div>
                    </div>
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
               <span className="font-medium">{patient.name}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Diagnosis:</span>
               <span className="font-medium">Acute Bronchitis</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Prescription:</span>
               <span className="font-medium">1 Item</span>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowFinishDialog(false)}>Cancel</Button>
             <Button onClick={() => setLocation("/dashboard")}>Confirm & Save</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Preview Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
         <DialogContent className="max-w-[600px]">
           <div className="border p-8 bg-white text-black space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <div>
                   <h1 className="text-xl font-bold">SmartCare Clinic</h1>
                   <p className="text-sm text-gray-500">Dr. Sarah Smith</p>
                 </div>
                 <div className="text-right text-sm">
                   <p>Date: {new Date().toLocaleDateString()}</p>
                   <p>Rx ID: #88392</p>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <h3 className="font-bold border-b w-full pb-1 mb-2">Patient Details</h3>
                 <p>Name: {patient.name}</p>
                 <p>Age: {patient.age} years</p>
              </div>

              <div className="space-y-4 min-h-[200px]">
                 <h3 className="font-bold text-xl">Rx</h3>
                 <div className="ml-4">
                    <p className="font-bold">Augmentin 1g</p>
                    <p className="text-sm">1 tablet every 12 hours for 7 days</p>
                 </div>
              </div>

               <div className="pt-8 border-t flex justify-between items-end">
                 <div className="text-xs text-gray-400">
                   Generated by SmartCare Systems
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

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
