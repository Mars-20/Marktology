# 🚀 Quick Start Guide - SmartCare Clinics MVP

## ✅ MVP مكتمل 100% - جاهز للتشغيل!

---

## 📋 المتطلبات

- ✅ Node.js 18+ مثبت
- ✅ npm مثبت
- ✅ حساب Neon Database (موجود)
- ✅ حساب Cloudinary (يجب إنشاؤه)

---

## 🎯 خطوات التشغيل السريع

### 1. تثبيت المكتبات ✅

```bash
npm install
```

**ملاحظة:** المكتبات المطلوبة تم تثبيتها بالفعل:
- ✅ cloudinary
- ✅ multer
- ✅ multer-storage-cloudinary
- ✅ @types/multer

### 2. إعداد Cloudinary 🔧

#### أ. إنشاء حساب:
1. اذهب إلى [cloudinary.com](https://cloudinary.com)
2. سجل حساب مجاني (25GB مجاني)
3. بعد التسجيل، اذهب إلى Dashboard

#### ب. الحصول على Credentials:
في Dashboard ستجد:
- **Cloud Name**: اسم الـ Cloud الخاص بك
- **API Key**: مفتاح API
- **API Secret**: السر الخاص بـ API

#### ج. إضافة إلى .env:
افتح ملف `.env` وأضف:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**مثال:**
```env
CLOUDINARY_CLOUD_NAME=smartcare-clinic
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 3. تشغيل السيرفر 🚀

```bash
npm run dev
```

**النتيجة المتوقعة:**
```
[CRON] Starting follow-up scheduler...
[CRON] Follow-up scheduler started successfully
[CRON] - Daily follow-up check: 8:00 AM
[CRON] - Overdue follow-ups check: 6:00 PM
[CRON] - Appointment reminders: Every hour
[MVP Routes] Additional MVP routes registered successfully
[File Upload Routes] File upload routes registered successfully
serving on port 5000
```

### 4. فتح التطبيق 🌐

افتح المتصفح واذهب إلى:
```
http://localhost:5000
```

---

## 🎯 اختبار الميزات الجديدة

### 1. صفحة المتابعات
```
http://localhost:5000/follow-ups
```

### 2. ملف المريض المحسّن
```
http://localhost:5000/patients/:id/profile
```

**الميزات:**
- ✅ 6 Tabs (نظرة عامة، سجل طبي، استشارات، ملفات، اتصالات، متابعات)
- ✅ رفع ملفات مع Cloudinary
- ✅ عرض جميع بيانات المريض

### 3. رفع ملف
1. اذهب إلى ملف المريض
2. اضغط على تبويب "الملفات"
3. اضغط "رفع ملف"
4. اختر ملف (JPG, PNG, PDF, DOC, DOCX)
5. اختر نوع الملف
6. أضف وصف (اختياري)
7. اضغط "رفع الملف"

---

## 📊 API Endpoints الجديدة

### Follow-up Tasks:
```bash
# قائمة المتابعات
GET /api/follow-up-tasks?clinic_id=xxx

# المتابعات المستحقة اليوم
GET /api/follow-up-tasks/due

# المتابعات المتأخرة
GET /api/follow-up-tasks/overdue

# إنشاء متابعة
POST /api/follow-up-tasks

# إكمال متابعة
POST /api/follow-up-tasks/:id/complete
```

### Communication Logs:
```bash
# سجل اتصالات المريض
GET /api/patients/:patientId/communications

# تسجيل اتصال جديد
POST /api/communication-logs
```

### Patient Files:
```bash
# ملفات المريض
GET /api/patients/:patientId/files

# رفع ملف
POST /api/patient-files/upload

# رفع عدة ملفات
POST /api/patient-files/upload-multiple

# حذف ملف
DELETE /api/patient-files/:id/delete
```

### Enhanced Endpoints:
```bash
# ملف المريض الشامل
GET /api/patients/:id/full-profile

# إحصائيات Dashboard
GET /api/dashboard/stats?doctor_id=xxx&clinic_id=xxx
```

---

## 🧪 اختبار API

### باستخدام curl:

```bash
# رفع ملف
curl -X POST http://localhost:5000/api/patient-files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf" \
  -F "patient_id=patient-id" \
  -F "clinic_id=clinic-id" \
  -F "file_type=lab_result" \
  -F "description=نتيجة تحليل دم"
```

### باستخدام Postman:

1. افتح Postman
2. اختر POST
3. URL: `http://localhost:5000/api/patient-files/upload`
4. Headers: `Authorization: Bearer <token>`
5. Body: form-data
   - file: اختر ملف
   - patient_id: ID المريض
   - clinic_id: ID العيادة
   - file_type: نوع الملف
   - description: وصف

---

## 🔍 التحقق من Cron Jobs

### عرض Logs:

```bash
# في terminal السيرفر، ستظهر رسائل Cron Jobs:
[CRON] Running daily follow-up check...
[CRON] Found 5 due follow-up tasks
[CRON] Follow-up notifications sent successfully
```

### اختبار يدوي:

يمكنك اختبار Cron Jobs يدوياً عن طريق:
1. إنشاء متابعة مستحقة اليوم
2. انتظار 8:00 AM
3. التحقق من الإشعارات

---

## 📁 هيكل الملفات الجديدة

```
server/
├── cron/
│   └── followUpScheduler.ts          ✅ Cron Jobs
├── fileStorage.ts                    ✅ Cloudinary setup
├── routes-file-upload.ts             ✅ File upload routes
├── routes-mvp-additions.ts           ✅ MVP routes
├── storage-mvp-additions.ts          ✅ Storage functions
└── __tests__/
    ├── api.test.ts                   ✅ API tests
    └── cron.test.ts                  ✅ Cron tests

client/src/
├── components/
│   └── FileUpload.tsx                ✅ File upload component
└── pages/
    ├── followups/
    │   └── FollowUpList.tsx          ✅ Follow-ups page
    └── patients/
        └── PatientProfileEnhanced.tsx ✅ Enhanced profile
```

---

## 🐛 استكشاف الأخطاء

### مشكلة: Cloudinary credentials غير صحيحة

**الحل:**
1. تحقق من `.env`
2. تأكد من نسخ credentials بشكل صحيح
3. لا توجد مسافات زائدة
4. أعد تشغيل السيرفر

### مشكلة: فشل رفع الملف

**الحل:**
1. تحقق من حجم الملف (max 10MB)
2. تحقق من نوع الملف (JPG, PNG, PDF, DOC, DOCX)
3. تحقق من Cloudinary credentials
4. راجع console logs

### مشكلة: Cron Jobs لا تعمل

**الحل:**
1. تحقق من أن السيرفر يعمل
2. راجع console logs
3. تحقق من timezone (Africa/Cairo)
4. انتظر الوقت المحدد للـ Cron Job

### مشكلة: Database connection error

**الحل:**
1. تحقق من `.env` - DATABASE_URL
2. تحقق من اتصال الإنترنت
3. تحقق من Neon project status
4. راجع Neon Console

---

## 📚 الوثائق الكاملة

للمزيد من التفاصيل، راجع:

- `MVP_COMPLETE_FINAL.md` - الوثائق الكاملة
- `FILE_STORAGE_SETUP.md` - دليل File Storage
- `DATABASE_MIGRATION_COMPLETE.md` - دليل Database
- `FINAL_STATUS.md` - حالة المشروع

---

## ✅ Checklist التشغيل

- [ ] تثبيت المكتبات (`npm install`)
- [ ] إنشاء حساب Cloudinary
- [ ] إضافة Cloudinary credentials إلى `.env`
- [ ] تشغيل السيرفر (`npm run dev`)
- [ ] فتح التطبيق في المتصفح
- [ ] اختبار رفع ملف
- [ ] اختبار صفحة المتابعات
- [ ] اختبار ملف المريض المحسّن

---

## 🎉 تهانينا!

إذا وصلت هنا، فالتطبيق يعمل بنجاح! 🎊

**الميزات المتاحة:**
- ✅ نظام متابعة آلي
- ✅ سجل اتصالات شامل
- ✅ إدارة ملفات مع Cloudinary
- ✅ ملف مريض محسّن
- ✅ Dashboard محسّن
- ✅ Cron Jobs تلقائية

**الخطوة التالية:**
- استكشف الميزات الجديدة
- اختبر رفع الملفات
- راجع الإشعارات
- استمتع بالتطبيق! 🚀

---

**التاريخ:** 2025-12-30  
**الحالة:** ✅ جاهز للتشغيل  
**المطور:** Kiro AI Assistant

