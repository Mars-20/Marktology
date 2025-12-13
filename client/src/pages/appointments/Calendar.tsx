import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Plus, MoreHorizontal } from "lucide-react";
import { MOCK_APPOINTMENTS } from "@/lib/mockData";
import { format, addHours, startOfToday, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"
  ];

  const appointmentsForDay = MOCK_APPOINTMENTS.filter(a => isSameDay(a.date, date || new Date()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">Manage your schedule and bookings.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>Schedule a new visit for a patient.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Patient Name</Label>
                  <Input placeholder="Search patient..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <Select>
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
                   <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Visit Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="checkup">Check-up</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Book Appointment</Button>
              </DialogFooter>
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
                    <span className="font-medium">8</span>
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
                   <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                   <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {timeSlots.map((slot) => {
                const apt = appointmentsForDay.find(a => a.time === slot);
                return (
                  <div key={slot} className="flex border-b last:border-0 min-h-[80px]">
                    <div className="w-24 border-r p-4 text-sm text-muted-foreground font-medium bg-muted/10">
                      {slot}
                    </div>
                    <div className="flex-1 p-2">
                      {apt ? (
                        <div className="h-full w-full rounded-md border bg-primary/5 border-primary/20 p-3 flex justify-between items-center hover:bg-primary/10 transition-colors cursor-pointer">
                           <div>
                              <p className="font-semibold text-primary">{apt.patientName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-[10px] h-5 bg-background">{apt.type}</Badge>
                                <span>with {apt.doctor}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {apt.status === "Scheduled" && (
                                <Button size="sm" variant="secondary" className="h-6 text-xs px-2">
                                  Mark Attendance
                                </Button>
                             )}
                             <Badge variant={apt.status === "Completed" ? "secondary" : "default"}>
                                {apt.status}
                             </Badge>
                           </div>
                        </div>
                      ) : (
                         <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground border border-dashed">
                               <Plus className="mr-1 h-3 w-3" /> Book Slot
                            </Button>
                         </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
