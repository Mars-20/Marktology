# 🏥 دليل تسجيل العيادات من قبل المسؤول

## 📋 نظرة عامة

هذا الدليل يشرح كيفية تسجيل العيادات من قبل المسؤول وكيفية دخول الأطباء إلى عياداتهم.

---

## 🔐 الأكواد المُولّدة

### 1. كود العيادة (Clinic Code)
- **الصيغة:** `CL-XXXXX`
- **مثال:** `CL-12345`
- **الاستخدام:** هذا هو الـ ID الفريد للعيادة في النظام
- **ملاحظة:** يتم توليده تلقائياً ويُستخدم كـ `clinic_id` في قاعدة البيانات

### 2. رقم الترخيص (License Number)
- **الصيغة:** `LIC-YYYYMMDD-XXXX`
- **مثال:** `LIC-20251230-1234`
- **الاستخدام:** رقم ترخيص رسمي للعيادة
- **ملاحظة:** يحتوي على التاريخ + رقم عشوائي

### 3. اسم المستخدم (Username)
- **الصيغة:** `firstname.lastname`
- **مثال:** `ahmed.hassan`
- **الاستخدام:** اسم المستخدم لتسجيل الدخول
- **ملاحظة:** يتم توليده من اسم المسؤول، وإذا كان موجوداً يضاف رقم

### 4. كلمة المرور المؤقتة (Temporary Password)
- **الصيغة:** `Clinic@XXXX`
- **مثال:** `Clinic@1234`
- **الاستخدام:** كلمة مرور مؤقتة للدخول الأول
- **ملاحظة:** يجب تغييرها عند أول تسجيل دخول

---

## 🎯 عملية التسجيل

### الطريقة 1: التسجيل العام (Public Registration)

#### الخطوات:
1. **الذهاب لصفحة التسجيل:**
   ```
   http://localhost:5000/register-clinic
   ```

2. **الخطوة 1 - معلومات العيادة:**
   - اسم العيادة
   - التخصص
   - العنوان
   - الهاتف
   - البريد الإلكتروني

3. **الخطوة 2 - معلومات المسؤول:**
   - الاسم الأول
   - اسم العائلة
   - البريد الإلكتروني
   - الهاتف
   - التخصص (اختياري)

4. **النتيجة:**
   ```
   ✅ كود العيادة: CL-12345
   ✅ اسم المستخدم: ahmed.hassan
   ✅ كلمة المرور المؤقتة: Clinic@1234
   ✅ رقم الترخيص: LIC-20251230-1234
   ```

5. **الحالة:**
   - العيادة تكون في حالة `pending`
   - تحتاج موافقة المسؤول للتفعيل

### الطريقة 2: التسجيل من قبل المسؤول (Admin Registration)

#### API Endpoint:
```http
POST /api/register-clinic
Content-Type: application/json

{
  "name": "مركز القاهرة الطبي",
  "address": "123 شارع النيل، القاهرة",
  "phone": "+20 123 456 7890",
  "email": "info@cairo-medical.com",
  "specialty": "عام",
  "owner_first_name": "أحمد",
  "owner_last_name": "حسن",
  "owner_email": "ahmed.hassan@cairo-medical.com",
  "owner_phone": "+20 123 456 7891",
  "owner_specialization": "طب عام"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Clinic registered successfully",
  "data": {
    "clinic": {
      "id": "CL-12345",
      "code": "CL-12345",
      "name": "مركز القاهرة الطبي",
      "license_number": "LIC-20251230-1234",
      "status": "pending"
    },
    "owner": {
      "id": "user-uuid",
      "username": "ahmed.hassan",
      "temporary_password": "Clinic@1234",
      "full_name": "أحمد حسن",
      "email": "ahmed.hassan@cairo-medical.com"
    },
    "access_info": {
      "clinic_code": "CL-12345",
      "username": "ahmed.hassan",
      "temporary_password": "Clinic@1234",
      "login_url": "http://localhost:5000"
    }
  }
}
```

---

## ✅ تفعيل العيادة (Admin Only)

### API Endpoint:
```http
POST /api/admin/clinics/CL-12345/activate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notes": "تم التحقق من جميع المستندات"
}
```

### Response:
```json
{
  "success": true,
  "message": "Clinic activated successfully",
  "clinic": {
    "id": "CL-12345",
    "status": "active",
    "approved_at": "2025-12-30T10:00:00Z"
  }
}
```

---

## 🔑 تسجيل الدخول

### للطبيب/المسؤول:

#### الطريقة 1: باستخدام اسم المستخدم
```
Username: ahmed.hassan
Password: Clinic@1234
```

#### الطريقة 2: باستخدام البريد الإلكتروني
```
Email: ahmed.hassan@cairo-medical.com
Password: Clinic@1234
```

### في صفحة Login:

1. **اختر Tab "Clinic Owner"**
2. **أدخل:**
   - Clinic ID: `ahmed.hassan` (اسم المستخدم)
   - Admin Password: `Clinic@1234`
3. **اضغط "Login as Owner"**

---

## ⚠️ المشكلة الحالية والحل

### المشكلة:
صفحة Login تطلب "Clinic ID" لكن النظام يتوقع `username`.

### الحل:
يجب تحديث صفحة Login لتوضيح أن الحقل يقبل:
- اسم المستخدم (username)
- أو البريد الإلكتروني (email)

---

## 📝 سيناريو كامل

### 1. المسؤول يسجل عيادة جديدة:

```bash
curl -X POST http://localhost:5000/api/register-clinic \
  -H "Content-Type: application/json" \
  -d '{
    "name": "عيادة النور",
    "address": "456 شارع الهرم، الجيزة",
    "phone": "+20 111 222 3333",
    "email": "info@alnoor-clinic.com",
    "specialty": "أسنان",
    "owner_first_name": "فاطمة",
    "owner_last_name": "محمد",
    "owner_email": "fatma.mohamed@alnoor-clinic.com",
    "owner_phone": "+20 111 222 3334",
    "owner_specialization": "طب أسنان"
  }'
```

### 2. النظام يُرجع:
```json
{
  "clinic_code": "CL-67890",
  "username": "fatma.mohamed",
  "temporary_password": "Clinic@5678",
  "license_number": "LIC-20251230-5678"
}
```

### 3. المسؤول يُفعّل العيادة:
```bash
curl -X POST http://localhost:5000/api/admin/clinics/CL-67890/activate \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "تم التفعيل"}'
```

### 4. الطبيب يسجل الدخول:
- يذهب إلى: `http://localhost:5000`
- يختار Tab "Clinic Owner"
- يدخل:
  - Username: `fatma.mohamed`
  - Password: `Clinic@5678`
- يضغط "Login as Owner"

### 5. أول تسجيل دخول:
- النظام يطلب تغيير كلمة المرور
- الطبيب يُغيّر كلمة المرور
- يدخل إلى Dashboard

---

## 🔍 التحقق من الأكواد

### 1. التحقق من توفر البريد الإلكتروني:
```http
POST /api/register-clinic/check-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 2. التحقق من توفر الهاتف:
```http
POST /api/register-clinic/check-phone
Content-Type: application/json

{
  "phone": "+20 123 456 7890"
}
```

### 3. توليد كود عيادة جديد (Admin):
```http
GET /api/admin/generate-clinic-code
Authorization: Bearer <admin-token>
```

### 4. توليد رقم ترخيص جديد (Admin):
```http
GET /api/admin/generate-license-number
Authorization: Bearer <admin-token>
```

---

## 📊 قاعدة البيانات

### جدول Clinics:
```sql
CREATE TABLE clinics (
  id VARCHAR PRIMARY KEY,              -- CL-12345
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  specialty TEXT,
  license_number TEXT,                 -- LIC-20251230-1234
  status clinic_status DEFAULT 'pending',
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  registration_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### جدول Users:
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  clinic_id VARCHAR REFERENCES clinics(id),
  username TEXT UNIQUE NOT NULL,       -- ahmed.hassan
  password TEXT NOT NULL,              -- hashed Clinic@1234
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT NOT NULL,
  role user_role DEFAULT 'clinic_owner',
  status user_status DEFAULT 'active',
  specialization TEXT,
  registration_method registration_method DEFAULT 'clinic_owner',
  is_first_login BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Checklist للمسؤول

عند تسجيل عيادة جديدة، تأكد من:

- [ ] اسم العيادة واضح ومميز
- [ ] العنوان كامل ودقيق
- [ ] رقم الهاتف صحيح
- [ ] البريد الإلكتروني صحيح وغير مُستخدم
- [ ] معلومات المسؤول كاملة
- [ ] التخصص محدد
- [ ] حفظ الأكواد المُولّدة:
  - كود العيادة
  - اسم المستخدم
  - كلمة المرور المؤقتة
  - رقم الترخيص
- [ ] إرسال المعلومات للطبيب
- [ ] تفعيل العيادة بعد التحقق

---

## 🎯 ملاحظات مهمة

### 1. الأمان:
- ✅ كلمات المرور مُشفّرة (bcrypt)
- ✅ الأكواد فريدة ولا تتكرر
- ✅ التحقق من البريد والهاتف
- ✅ Validation شاملة

### 2. تسجيل الدخول:
- ✅ يمكن استخدام username أو email
- ✅ كلمة المرور المؤقتة تعمل
- ✅ يجب تغيير كلمة المرور عند أول دخول

### 3. الحالات:
- `pending` - في انتظار الموافقة
- `active` - مُفعّلة
- `rejected` - مرفوضة
- `suspended` - مُعلّقة

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. تحقق من الأكواد المُولّدة
2. تأكد من تفعيل العيادة
3. تحقق من صحة username و password
4. راجع logs السيرفر

---

**التاريخ:** 2025-12-30  
**الحالة:** ✅ موثق بالكامل  
**المطور:** Kiro AI Assistant

