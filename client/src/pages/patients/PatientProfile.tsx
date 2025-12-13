import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_PATIENTS } from "@/lib/mockData";
import { ArrowLeft, Calendar, FileText, Activity, Phone, Mail, MapPin, Edit, Clock, Stethoscope, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PatientProfile() {
  const [, params] = useRoute("/patients/:id");
  const id = params?.id;
  
  // In a real app, we'd fetch based on ID. For now, just grab the first one or find by ID if we had a real store.
  const patient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];

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
            <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">ID: {patient.id}</Badge>
              <span>&middot;</span>
              <span>{patient.age} Years, {patient.gender}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
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
                    <Label>Specialty</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardio">Cardiology</SelectItem>
                        <SelectItem value="derma">Dermatology</SelectItem>
                        <SelectItem value="ortho">Orthopedics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Doctor/Clinic</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-ali">Dr. Ali Ahmed (Cairo Clinic)</SelectItem>
                        <SelectItem value="dr-mona">Dr. Mona Zaki (Specialist Center)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Referral Note</Label>
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
                 <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold mb-4 ${patient.avatarColor}`}>
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h3 className="font-bold text-lg">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">{patient.condition}</p>
                  <div className="mt-4 flex justify-center">
                    <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                        {patient.status}
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
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>email@example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Cairo, Egypt</span>
                </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vitals (Last Visit)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Blood Pressure</span>
                  <span className="font-medium">120/80</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Heart Rate</span>
                  <span className="font-medium">72 bpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">75 kg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Medical History</TabsTrigger>
                <TabsTrigger value="visits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Visits & Notes</TabsTrigger>
                <TabsTrigger value="medications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Medications</TabsTrigger>
                <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Files</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chronic Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span>Hypertension</span>
                        <Badge variant="outline">Since 2020</Badge>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <span>Type 2 Diabetes</span>
                        <Badge variant="outline">Since 2018</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Badge variant="destructive">Penicillin</Badge>
                      <Badge variant="destructive">Peanuts</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits" className="mt-6">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Consultation - Dr. Sarah Smith</CardTitle>
                            <CardDescription>Oct 15, 2023 &middot; 10:30 AM</CardDescription>
                          </div>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Patient complained of headaches and dizziness. BP elevated. Adjusted medication dosage and recommended low sodium diet.
                        </p>
                        <div className="mt-4 flex gap-2">
                           <Badge variant="secondary">Follow-up Required</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
               <TabsContent value="medications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">Lisinopril 10mg</p>
                          <p className="text-sm text-muted-foreground">1 tablet daily in the morning</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                       <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">Metformin 500mg</p>
                          <p className="text-sm text-muted-foreground">1 tablet twice daily with meals</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
