import { addDays, subDays, format } from "date-fns";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  lastVisit: string;
  status: "Active" | "Inactive";
  condition: string;
  nextAppointment?: string;
  avatarColor: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  time: string;
  type: "Consultation" | "Follow-up" | "Check-up";
  status: "Scheduled" | "Completed" | "Cancelled" | "In-Progress";
  doctor: string;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "P001",
    name: "Ahmed Hassan",
    age: 45,
    gender: "Male",
    phone: "+20 123 456 7890",
    lastVisit: "2023-10-15",
    status: "Active",
    condition: "Hypertension",
    nextAppointment: "2023-11-20",
    avatarColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "P002",
    name: "Layla Mahmoud",
    age: 32,
    gender: "Female",
    phone: "+20 111 222 3333",
    lastVisit: "2023-11-01",
    status: "Active",
    condition: "Pregnancy Checkup",
    nextAppointment: "2023-11-15",
    avatarColor: "bg-pink-100 text-pink-700",
  },
  {
    id: "P003",
    name: "Omar Khaled",
    age: 28,
    gender: "Male",
    phone: "+20 100 555 6666",
    lastVisit: "2023-09-20",
    status: "Inactive",
    condition: "Flu (Recovered)",
    avatarColor: "bg-green-100 text-green-700",
  },
  {
    id: "P004",
    name: "Nour El-Din",
    age: 60,
    gender: "Female",
    phone: "+20 155 888 9999",
    lastVisit: "2023-11-10",
    status: "Active",
    condition: "Diabetes Type 2",
    nextAppointment: "2023-11-18",
    avatarColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "P005",
    name: "Karim Samir",
    age: 12,
    gender: "Male",
    phone: "+20 122 333 4444",
    lastVisit: "2023-11-12",
    status: "Active",
    condition: "Asthma",
    nextAppointment: "2023-12-01",
    avatarColor: "bg-yellow-100 text-yellow-700",
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "A001",
    patientId: "P002",
    patientName: "Layla Mahmoud",
    date: new Date(), // Today
    time: "09:30 AM",
    type: "Check-up",
    status: "Completed",
    doctor: "Dr. Sarah",
  },
  {
    id: "A002",
    patientId: "P001",
    patientName: "Ahmed Hassan",
    date: new Date(), // Today
    time: "10:00 AM",
    type: "Follow-up",
    status: "In-Progress",
    doctor: "Dr. Sarah",
  },
  {
    id: "A003",
    patientId: "P004",
    patientName: "Nour El-Din",
    date: new Date(), // Today
    time: "11:30 AM",
    type: "Consultation",
    status: "Scheduled",
    doctor: "Dr. Sarah",
  },
  {
    id: "A004",
    patientId: "P005",
    patientName: "Karim Samir",
    date: addDays(new Date(), 1), // Tomorrow
    time: "02:00 PM",
    type: "Consultation",
    status: "Scheduled",
    doctor: "Dr. Sarah",
  }
];

export const MOCK_STATS = [
  { title: "Total Patients", value: "1,240", change: "+12%", trend: "up" },
  { title: "Today's Appointments", value: "8", change: "On track", trend: "neutral" },
  { title: "Pending Follow-ups", value: "5", change: "-2", trend: "down" },
  { title: "Monthly Revenue", value: "45,000 EGP", change: "+8%", trend: "up" },
];
