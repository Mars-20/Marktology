import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePatients, useCreatePatient, useDeletePatient } from "@/hooks/usePatients";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useState } from "react";
import { format, differenceInYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-yellow-100 text-yellow-700",
    "bg-red-100 text-red-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function PatientList() {
  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const clinicId = user?.clinic_id || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: patientsData, isLoading, error } = usePatients(clinicId, {
    search: searchQuery || undefined,
    status: statusFilter || undefined,
  });

  const createPatient = useCreatePatient();
  const deletePatient = useDeletePatient();

  const patients = patientsData?.patients || [];

  const [formData, setFormData] = useState({
    clinic_id: "",
    full_name: "",
    file_number: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient.mutateAsync({
        ...formData,
        clinic_id: clinicId,
      });
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        clinic_id: "",
        full_name: "",
        file_number: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        blood_type: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatient.mutateAsync(id);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
            <p className="text-muted-foreground">Manage patient records and history.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Enter the patient's basic information to create a new profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        required
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      required
                      placeholder="+20 123 456 7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPatient.isPending}>
                    {createPatient.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>All Patients</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or phone..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage error={error} />
            ) : !patients || patients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No patients found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => {
                    const age = differenceInYears(new Date(), new Date(patient.date_of_birth));
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(patient.full_name)}`}>
                              {patient.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{patient.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{age} / {patient.gender}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="font-mono text-xs">{patient.file_number}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(patient.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/patients/${patient.id}`}>
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                              </Link>
                              <Link href={`/consultations/new?patientId=${patient.id}`}>
                                <DropdownMenuItem>Start Consultation</DropdownMenuItem>
                              </Link>
                              <Link href={`/appointments/new?patientId=${patient.id}`}>
                                <DropdownMenuItem>Book Appointment</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(patient.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
