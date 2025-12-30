import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PatientFile {
  id: string;
  patient_id: string;
  clinic_id: string;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  description: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

interface PatientFilesProps {
  patientId: string;
  clinicId: string;
}

const fileTypeLabels: Record<string, string> = {
  lab_result: "نتيجة تحليل",
  radiology: "أشعة",
  prescription: "روشتة",
  report: "تقرير طبي",
  other: "أخرى",
};

const fileTypeIcons: Record<string, any> = {
  lab_result: FileSpreadsheet,
  radiology: FileImage,
  prescription: FileText,
  report: FileText,
  other: FileText,
};

export default function PatientFiles({ patientId, clinicId }: PatientFilesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file_type: "lab_result",
    file_name: "",
    file_url: "",
    description: "",
  });

  // Fetch patient files
  const { data: filesData, isLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}/files`],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${patientId}/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/patients/${patientId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clinic_id: clinicId,
        }),
      });
      if (!res.ok) throw new Error("Failed to upload file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/patients/${patientId}/files`],
      });
      toast({
        title: "تم رفع الملف",
        description: "تم رفع الملف بنجاح",
      });
      setIsUploadOpen(false);
      setUploadData({
        file_type: "lab_result",
        file_name: "",
        file_url: "",
        description: "",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في رفع الملف",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await fetch(`/api/patients/${patientId}/files/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/patients/${patientId}/files`],
      });
      toast({
        title: "تم حذف الملف",
        description: "تم حذف الملف بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الملف",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!uploadData.file_name || !uploadData.file_url) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    uploadFileMutation.mutate(uploadData);
  };

  const files = filesData?.files || [];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">الملفات الطبية</h3>
        <Button onClick={() => setIsUploadOpen(true)} size="sm">
          <Upload className="h-4 w-4 ml-2" />
          رفع ملف
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد ملفات مرفوعة
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file: PatientFile) => {
            const Icon = fileTypeIcons[file.file_type] || FileText;
            return (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{file.file_name}</h4>
                          <Badge variant="outline">
                            {fileTypeLabels[file.file_type]}
                          </Badge>
                        </div>
                        {file.description && (
                          <p className="text-sm text-muted-foreground">
                            {file.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          تم الرفع في:{" "}
                          {format(new Date(file.uploaded_at), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.file_url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFileMutation.mutate(file.id)}
                        disabled={deleteFileMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفع ملف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>نوع الملف</Label>
              <Select
                value={uploadData.file_type}
                onValueChange={(value) =>
                  setUploadData({ ...uploadData, file_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fileTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اسم الملف</Label>
              <Input
                value={uploadData.file_name}
                onChange={(e) =>
                  setUploadData({ ...uploadData, file_name: e.target.value })
                }
                placeholder="مثال: تحليل دم شامل"
              />
            </div>
            <div>
              <Label>رابط الملف</Label>
              <Input
                value={uploadData.file_url}
                onChange={(e) =>
                  setUploadData({ ...uploadData, file_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>وصف (اختياري)</Label>
              <Textarea
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                placeholder="أضف وصف للملف..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadFileMutation.isPending}
            >
              {uploadFileMutation.isPending ? "جاري الرفع..." : "رفع الملف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
