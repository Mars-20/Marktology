import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DATA_VISITS = [
  { name: 'Mon', visits: 12 },
  { name: 'Tue', visits: 19 },
  { name: 'Wed', visits: 15 },
  { name: 'Thu', visits: 22 },
  { name: 'Fri', visits: 28 },
  { name: 'Sat', visits: 10 },
  { name: 'Sun', visits: 5 },
];

const DATA_REVENUE = [
  { name: 'Week 1', value: 5000 },
  { name: 'Week 2', value: 7500 },
  { name: 'Week 3', value: 6200 },
  { name: 'Week 4', value: 8900 },
];

const COMMUNICATION_LOGS = [
  { id: 1, patient: "Ahmed Hassan", type: "SMS Reminder", status: "Sent", time: "2 hours ago" },
  { id: 2, patient: "Layla Mahmoud", type: "Email Report", status: "Opened", time: "5 hours ago" },
  { id: 3, patient: "Karim Samir", type: "Phone Call", status: "No Answer", time: "1 day ago" },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Insights into clinic performance and patient engagement.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Visits</CardTitle>
              <CardDescription>Number of patient visits over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DATA_VISITS}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Financial performance for the current month.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DATA_REVENUE}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" tickLine={false} axisLine={false} />
                   <YAxis tickLine={false} axisLine={false} />
                   <Tooltip />
                   <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Communication Log</CardTitle>
            <CardDescription>Recent automated messages and calls to patients.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMMUNICATION_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.patient}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.status}</TableCell>
                      <TableCell className="text-muted-foreground">{log.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
