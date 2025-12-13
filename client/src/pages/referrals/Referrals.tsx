import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Check, X, FileText } from "lucide-react";

const INCOMING_REFERRALS = [
  { id: 1, patient: "Layla Mahmoud", from: "Dr. Mona Zaki", date: "2023-11-12", reason: "Cardiology Consult", status: "Pending" },
  { id: 2, patient: "Omar Khaled", from: "Cairo General Hospital", date: "2023-11-10", reason: "Post-op follow up", status: "Accepted" },
];

const OUTGOING_REFERRALS = [
  { id: 3, patient: "Ahmed Hassan", to: "Dr. Ali Ahmed (Ortho)", date: "2023-11-05", reason: "Knee Surgery Eval", status: "Completed" },
  { id: 4, patient: "Nour El-Din", to: "Al-Amal Labs", date: "2023-11-13", reason: "Full Blood Panel", status: "Pending" },
];

export default function Referrals() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referrals</h2>
          <p className="text-muted-foreground">Manage incoming patient transfers and outgoing consultations.</p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Referrals</CardTitle>
                <CardDescription>Patients referred to your clinic.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INCOMING_REFERRALS.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.patient}</TableCell>
                        <TableCell>{ref.from}</TableCell>
                        <TableCell>{ref.date}</TableCell>
                        <TableCell>{ref.reason}</TableCell>
                        <TableCell>
                          <Badge variant={ref.status === "Pending" ? "outline" : "secondary"}>
                            {ref.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {ref.status === "Pending" && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {ref.status !== "Pending" && (
                             <Button size="sm" variant="ghost">View Details</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Referrals</CardTitle>
                <CardDescription>Patients you have referred to other specialists.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Referred To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {OUTGOING_REFERRALS.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.patient}</TableCell>
                        <TableCell>{ref.to}</TableCell>
                        <TableCell>{ref.date}</TableCell>
                        <TableCell>{ref.reason}</TableCell>
                        <TableCell>
                          <Badge variant={ref.status === "Pending" ? "outline" : "secondary"}>
                            {ref.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button size="sm" variant="ghost">
                             <FileText className="h-4 w-4 mr-2" />
                             Summary
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
