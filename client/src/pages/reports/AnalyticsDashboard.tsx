import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Activity, 
  Download,
  Phone,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ar } from "date-fns/locale";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const clinicId = "clinic-id"; // Get from context/auth
  
  // Fetch clinic analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/analytics/clinic/${clinicId}`, dateRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/clinic/${clinicId}?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });
  
  // Fetch daily appointments
  const { data: dailyAppointments } = useQuery({
    queryKey: [`/api/analytics/clinic/${clinicId}/daily-appointments`, dateRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/clinic/${clinicId}/daily-appointments?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      if (!response.ok) throw new Error('Failed to fetch daily appointments');
      return response.json();
    },
  });
  
  // Fetch demographics
  const { data: demographics } = useQuery({
    queryKey: [`/api/analytics/clinic/${clinicId}/demographics`],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/clinic/${clinicId}/demographics`);
      if (!response.ok) throw new Error('Failed to fetch demographics');
      return response.json();
    },
  });
  
  // Fetch top doctors
  const { data: topDoctors } = useQuery({
    queryKey: [`/api/analytics/clinic/${clinicId}/top-doctors`, dateRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/clinic/${clinicId}/top-doctors?start_date=${dateRange.start}&end_date=${dateRange.end}&limit=5`
      );
      if (!response.ok) throw new Error('Failed to fetch top doctors');
      return response.json();
    },
  });
  
  const handleExport = async () => {
    window.open(
      `/api/analytics/clinic/${clinicId}/export?start_date=${dateRange.start}&end_date=${dateRange.end}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل التحليلات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">التحليلات والتقارير</h2>
            <p className="text-muted-foreground">رؤى شاملة عن أداء العيادة</p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {format(new Date(dateRange.start), 'dd MMM', { locale: ar })} - {format(new Date(dateRange.end), 'dd MMM', { locale: ar })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">من تاريخ</label>
                    <Calendar
                      mode="single"
                      selected={new Date(dateRange.start)}
                      onSelect={(date) => date && setDateRange({ ...dateRange, start: format(date, 'yyyy-MM-dd') })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">إلى تاريخ</label>
                    <Calendar
                      mode="single"
                      selected={new Date(dateRange.end)}
                      onSelect={(date) => date && setDateRange({ ...dateRange, end: format(date, 'yyyy-MM-dd') })}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport}>
              <Download className="ml-2 h-4 w-4" />
              تصدير CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المرضى</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.total_patients || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics?.overview.new_patients || 0} مريض جديد
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المواعيد</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.total_appointments || 0}</div>
              <p className="text-xs text-muted-foreground">
                في الفترة المحددة
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاستشارات</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.total_consultations || 0}</div>
              <p className="text-xs text-muted-foreground">
                استشارة مكتملة
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل المتابعة</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.follow_ups.completion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.follow_ups.completed || 0} من {analytics?.follow_ups.total || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            <TabsTrigger value="communications">الاتصالات</TabsTrigger>
            <TabsTrigger value="demographics">التركيبة السكانية</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>المواعيد اليومية</CardTitle>
                  <CardDescription>عدد المواعيد خلال الفترة المحددة</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyAppointments?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>حالة المواعيد</CardTitle>
                  <CardDescription>توزيع المواعيد حسب الحالة</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.appointments.by_status || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(analytics?.appointments.by_status || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>الاتصالات حسب النوع</CardTitle>
                  <CardDescription>توزيع الاتصالات حسب الوسيلة</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.communications.by_type || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معدل نجاح الاتصالات</CardTitle>
                  <CardDescription>نسبة الاتصالات الناجحة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-green-500" />
                        <span>اتصالات ناجحة</span>
                      </div>
                      <span className="text-2xl font-bold">{analytics?.communications.successful || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>إجمالي الاتصالات</span>
                      </div>
                      <span className="text-2xl font-bold">{analytics?.communications.total || 0}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">معدل النجاح</span>
                        <span className="text-3xl font-bold text-green-500">
                          {analytics?.communications.success_rate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع حسب الجنس</CardTitle>
                  <CardDescription>نسبة المرضى حسب الجنس</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographics?.gender || []}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(demographics?.gender || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع حسب الفئة العمرية</CardTitle>
                  <CardDescription>عدد المرضى في كل فئة عمرية</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographics?.age_groups || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age_group" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>أفضل الأطباء أداءً</CardTitle>
                <CardDescription>الأطباء الأكثر نشاطاً في الفترة المحددة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topDoctors?.data || []).map((doctor: any, index: number) => (
                    <div key={doctor.doctor_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{doctor.doctor_name}</p>
                          <p className="text-sm text-muted-foreground">طبيب</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold">{doctor.consultation_count}</p>
                        <p className="text-sm text-muted-foreground">استشارة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
