import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, isSameDay, addDays, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const clinicId = user?.clinic_id || '';
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointmentsData, isLoading } = useAppointments(clinicId, {
    date: date ? format(date, 'yyyy-MM-dd') : undefined,
  });

  const { data: patientsData } = usePatients(clinicId, { status: 'active' });
  const createAppointment = useCreateAppointment();

  const appointments = appointmentsData?.appointments || [];
  const patients = patientsData?.patients || [];

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: date ? format(date, 'yyyy-MM-dd') : "",
    appointment_time: "",
    type: "",
    duration_minutes: 30,
    notes: "",
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"
  ];

  const appointmentsForDay = appointments.filter((a) =>
    isSameDay(new Date(a.appointment_date), date || new Date())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment.mutateAsync({
        ...formData,
        clinic_id: clinicId,
        doctor_id: user?.id,
        status: "scheduled",
      });
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        patient_id: "",
        appointment_date: date ? format(date, 'yyyy-MM-dd') : "",
        appointment_time: "",
        type: "",
        duration_minutes: 30,
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const handlePrevDay = () => {
    if (date) {
      setDate(subDays(date, 1));
    }
  };

  const handleNextDay = () => {
    if (date) {
      setDate(addDays(date, 1));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">Manage your schedule and bookings.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Book Appointment</DialogTitle>
                  <DialogDescription>Schedule a new visit for a patient.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Patient</Label>
                    <Select
                      value={formData.patient_id}
                      onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        required
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Time</Label>
                      <Select
                        value={formData.appointment_time}
                        onValueChange={(value) => setFormData({ ...formData, appointment_time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Visit Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="check_up">Check-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes (Optional)</Label>
                    <Input
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAppointment.isPending}>
                    {createAppointment.isPending ? "Booking..." : "Book Appointment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-7 h-[calc(100vh-12rem)]">
          
          {/* Calendar Sidebar */}
          <Card className="md:col-span-3 lg:col-span-2 overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-b w-full"
              />
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-sm">Summary for {date ? format(date, 'MMM dd') : 'Today'}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Booked</span>
                    <span className="font-medium">{appointmentsForDay.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Slots</span>
                    <span className="font-medium">{timeSlots.length - appointmentsForDay.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule View */}
          <Card className="md:col-span-4 lg:col-span-5 flex flex-col">
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {date ? format(date, 'EEEE, MMMM do, yyyy') : 'Select a date'}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : (
                timeSlots.map((slot) => {
                  const apt = appointmentsForDay.find((a) => a.appointment_time === slot);
                  return (
                    <div key={slot} className="flex border-b last:border-0 min-h-[80px]">
                      <div className="w-24 border-r p-4 text-sm text-muted-foreground font-medium bg-muted/10">
                        {slot}
                      </div>
                      <div className="flex-1 p-2">
                        {apt ? (
                          <div className="h-full w-full rounded-md border bg-primary/5 border-primary/20 p-3 flex justify-between items-center hover:bg-primary/10 transition-colors cursor-pointer">
                            <div>
                              <p className="font-semibold text-primary">
                                Patient {apt.patient_id.substring(0, 8)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-[10px] h-5 bg-background">
                                  {apt.duration}min
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                apt.status === "completed" ? "secondary" :
                                apt.status === "in_progress" ? "default" :
                                "outline"
                              }>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-muted-foreground border border-dashed"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  appointment_time: slot,
                                  appointment_date: date ? format(date, 'yyyy-MM-dd') : "",
                                });
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Book Slot
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
