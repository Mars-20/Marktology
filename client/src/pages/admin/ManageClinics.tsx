import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, PauseCircle, Eye, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialty: string | null;
  license_number: string | null;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  registration_date: string;
  approved_at: string | null;
  rejection_reason: string | null;
  stats?: {
    total_patients: number;
    total_appointments: number;
  };
}

export default function ManageClinics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'reject' | 'suspend' | 'view' | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/clinics', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch clinics');
      return response.json();
    },
  });

  const activateMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const response = await fetch(`/api/admin/clinics/${id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to activate clinic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
      toast({
        title: "Clinic Activated",
        description: "The clinic has been successfully activated.",
      });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/clinics/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject clinic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
      toast({
        title: "Clinic Rejected",
        description: "The clinic registration has been rejected.",
      });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/clinics/${id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to suspend clinic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
      toast({
        title: "Clinic Suspended",
        description: "The clinic has been suspended.",
      });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clinics: Clinic[] = clinicsData?.clinics || [];
  const filteredClinics = clinics.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDialog = (clinic: Clinic, action: 'activate' | 'reject' | 'suspend' | 'view') => {
    setSelectedClinic(clinic);
    setActionType(action);
    setNotes("");
  };

  const closeDialog = () => {
    setSelectedClinic(null);
    setActionType(null);
    setNotes("");
  };

  const handleAction = () => {
    if (!selectedClinic || !actionType) return;

    if (actionType === 'activate') {
      activateMutation.mutate({ id: selectedClinic.id, notes });
    } else if (actionType === 'reject') {
      if (!notes.trim()) {
        toast({
          title: "Error",
          description: "Please provide a rejection reason",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({ id: selectedClinic.id, reason: notes });
    } else if (actionType === 'suspend') {
      if (!notes.trim()) {
        toast({
          title: "Error",
          description: "Please provide a suspension reason",
          variant: "destructive",
        });
        return;
      }
      suspendMutation.mutate({ id: selectedClinic.id, reason: notes });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionButtons = (clinic: Clinic) => {
    const buttons = [];

    buttons.push(
      <Button
        key="view"
        variant="ghost"
        size="sm"
        onClick={() => openDialog(clinic, 'view')}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    );

    if (clinic.status === 'pending') {
      buttons.push(
        <Button
          key="activate"
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
          onClick={() => openDialog(clinic, 'activate')}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Activate
        </Button>,
        <Button
          key="reject"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => openDialog(clinic, 'reject')}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      );
    }

    if (clinic.status === 'active') {
      buttons.push(
        <Button
          key="suspend"
          variant="ghost"
          size="sm"
          className="text-orange-600 hover:text-orange-700"
          onClick={() => openDialog(clinic, 'suspend')}
        >
          <PauseCircle className="h-4 w-4 mr-1" />
          Suspend
        </Button>
      );
    }

    if (clinic.status === 'suspended') {
      buttons.push(
        <Button
          key="reactivate"
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
          onClick={() => openDialog(clinic, 'activate')}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Reactivate
        </Button>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Manage Clinics</h1>
          <p className="text-muted-foreground">Review, activate, reject, or suspend clinic registrations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Clinics</CardTitle>
              <CardDescription>
                {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClinics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No clinics found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-mono text-xs font-medium">{clinic.id}</TableCell>
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell className="text-sm">{clinic.email}</TableCell>
                    <TableCell>{clinic.specialty || 'General'}</TableCell>
                    <TableCell>{getStatusBadge(clinic.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(clinic.registration_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {getActionButtons(clinic)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'view' && 'Clinic Details'}
              {actionType === 'activate' && 'Activate Clinic'}
              {actionType === 'reject' && 'Reject Clinic Registration'}
              {actionType === 'suspend' && 'Suspend Clinic'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'view' && 'View detailed information about this clinic'}
              {actionType === 'activate' && 'Approve this clinic registration and activate the account'}
              {actionType === 'reject' && 'Reject this clinic registration with a reason'}
              {actionType === 'suspend' && 'Temporarily suspend this clinic with a reason'}
            </DialogDescription>
          </DialogHeader>

          {selectedClinic && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Clinic ID</Label>
                  <p className="font-mono text-sm font-medium">{selectedClinic.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">License Number</Label>
                  <p className="font-mono text-sm">{selectedClinic.license_number || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">{selectedClinic.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Specialty</Label>
                  <p className="text-sm">{selectedClinic.specialty || 'General'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedClinic.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedClinic.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="text-sm">{selectedClinic.address}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedClinic.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Registration Date</Label>
                  <p className="text-sm">
                    {new Date(selectedClinic.registration_date).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedClinic.rejection_reason && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {selectedClinic.status === 'rejected' ? 'Rejection Reason' : 'Suspension Reason'}
                  </Label>
                  <p className="text-sm text-red-600 mt-1">{selectedClinic.rejection_reason}</p>
                </div>
              )}

              {actionType !== 'view' && (
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {actionType === 'activate' ? 'Notes (Optional)' : 'Reason (Required)'}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={
                      actionType === 'activate'
                        ? 'Add any notes about this activation...'
                        : actionType === 'reject'
                        ? 'Explain why this registration is being rejected...'
                        : 'Explain why this clinic is being suspended...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {actionType === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {actionType !== 'view' && (
              <Button
                onClick={handleAction}
                disabled={
                  activateMutation.isPending ||
                  rejectMutation.isPending ||
                  suspendMutation.isPending
                }
                variant={
                  actionType === 'activate'
                    ? 'default'
                    : actionType === 'reject'
                    ? 'destructive'
                    : 'default'
                }
              >
                {activateMutation.isPending ||
                rejectMutation.isPending ||
                suspendMutation.isPending
                  ? 'Processing...'
                  : actionType === 'activate'
                  ? 'Activate Clinic'
                  : actionType === 'reject'
                  ? 'Reject Registration'
                  : 'Suspend Clinic'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
