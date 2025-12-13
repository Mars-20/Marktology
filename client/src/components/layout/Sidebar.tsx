import { Plus, Search, Calendar, Users, FileText, Settings, Bell, LogOut, LayoutDashboard, Stethoscope, Activity, ArrowRightLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/generated_images/minimalist_medical_cross_logo_with_clean_lines.png";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Consultations", href: "/consultations", icon: Stethoscope },
    { name: "Referrals", href: "/referrals", icon: ArrowRightLeft },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <img src={logoUrl} alt="SmartCare Logo" className="h-8 w-8 rounded-md object-cover" />
          <span>SmartCare</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(`${link.href}/`);
            return (
              <Link key={link.name} href={link.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            DR
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">Dr. Sarah Smith</span>
            <span className="truncate text-xs text-muted-foreground">Cardiologist</span>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </Link>
      </div>
    </div>
  );
}
