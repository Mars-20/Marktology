import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadProps {
  patientId: string;
  clinicId: string;
  consultationId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUpload({
  patientId,
  clinicId,
  consultationId,
  open,
  onOpenChange,
}: FileUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [description, setDescription] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/patient-files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم حفظ الملف في سجل المريض",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/files`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/full-profile`] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل رفع الملف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار ملف",
        variant: "destructive",
      });
      return;
    }

    if (!fileType) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار نوع الملف",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    formData.append("clinic_id", clinicId);
    formData.append("file_type", fileType);
    if (consultationId) {
      formData.append("consultation_id", consultationId);
    }
    if (description) {
      formData.append("description", description);
    }

    uploadMutation.mutate(formData);
  };

  const handleClose = () => {
    setFile(null);
    setFileType("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>رفع ملف جديد</DialogTitle>
          <DialogDescription>
            قم برفع ملف طبي للمريض (نتائج تحاليل، أشعة، تقارير، إلخ)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">الملف</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              disabled={uploadMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              الصيغ المدعومة: JPG, PNG, PDF, DOC, DOCX (حد أقصى 10MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">نوع الملف</Label>
            <Select value={fileType} onValueChange={setFileType} disabled={uploadMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الملف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lab_result">نتيجة تحليل</SelectItem>
                <SelectItem value="radiology">أشعة</SelectItem>
                <SelectItem value="prescription">روشتة</SelectItem>
                <SelectItem value="report">تقرير طبي</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف (اختياري)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أضف وصف للملف..."
              rows={3}
              disabled={uploadMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="ml-2 h-4 w-4" />
                  رفع الملف
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
