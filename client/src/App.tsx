import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import PatientList from "@/pages/patients/PatientList";
import PatientProfile from "@/pages/patients/PatientProfile";
import ConsultationView from "@/pages/consultation/ConsultationView";
import Appointments from "@/pages/appointments/Calendar";
import Notifications from "@/pages/notifications/Notifications";
import Referrals from "@/pages/referrals/Referrals";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import RegisterClinic from "@/pages/auth/RegisterClinic";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register-clinic" component={RegisterClinic} />
      <Route path="/dashboard" component={DoctorDashboard} />
      <Route path="/patients" component={PatientList} />
      <Route path="/patients/:id" component={PatientProfile} />
      <Route path="/consultations" component={ConsultationView} />
      <Route path="/consultations/new" component={ConsultationView} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
