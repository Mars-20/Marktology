# 🚀 دليل البدء السريع - Marktology OS

## ⚡ البدء في 5 دقائق

### الخطوة 1: التحقق من المتطلبات (30 ثانية)

```bash
# تحقق من Node.js
node --version  # يجب أن يكون 18+

# تحقق من npm
npm --version
```

### الخطوة 2: تثبيت المشروع (2 دقيقة)

```bash
# تثبيت dependencies
npm install
```

### الخطوة 3: إعداد قاعدة البيانات (1 دقيقة)

```bash
# ملف .env موجود بالفعل مع connection string
# تحقق من الاتصال
cat .env | grep DATABASE_URL
```

**✅ Connection String جاهز:**
```
postgresql://neondb_owner:***@ep-green-heart-afpsaxq9-pooler.c-2.us-west-2.aws.neon.tech/neondb
```

### الخطوة 4: تشغيل التطبيق (30 ثانية)

```bash
# تشغيل في وضع التطوير
npm run dev
```

### الخطوة 5: فتح المتصفح (10 ثوانٍ)

```
افتح: http://localhost:5000
```

## 🎉 تم! التطبيق يعمل الآن

---

## 📋 الخطوات التفصيلية

### 1. فهم البنية

```
marktology-os/
├── client/          # React Frontend (Port 5000)
├── server/          # Express Backend (API)
├── shared/          # مشترك (Schema, Types)
└── .env             # إعدادات البيئة
```

### 2. الحسابات الافتراضية

#### System Admin
```
Username: admin
Password: admin123
```

#### Clinic Owner
```
Username: clinic_owner
Password: clinic123
```

#### Doctor
```
Username: doctor
Password: doctor123
```

### 3. الصفحات الرئيسية

```
/                    # الصفحة الرئيسية
/login               # تسجيل الدخول
/register-clinic     # تسجيل عيادة جديدة
/dashboard           # لوحة التحكم
/patients            # إدارة المرضى
/appointments        # المواعيد
/consultations       # الكشوفات
/referrals           # الإحالات
/notifications       # الإشعارات
/settings            # الإعدادات
```

### 4. API Endpoints

```
POST   /api/auth/login           # تسجيل الدخول
POST   /api/auth/logout          # تسجيل الخروج
GET    /api/auth/me              # المستخدم الحالي

GET    /api/clinics              # قائمة العيادات
POST   /api/clinics              # تسجيل عيادة
GET    /api/clinics/:id          # تفاصيل عيادة

GET    /api/patients             # قائمة المرضى
POST   /api/patients             # إضافة مريض
GET    /api/patients/:id         # تفاصيل مريض

GET    /api/appointments         # قائمة المواعيد
POST   /api/appointments         # حجز موعد
PATCH  /api/appointments/:id     # تحديث موعد

GET    /api/consultations        # قائمة الكشوفات
POST   /api/consultations        # إضافة كشف
PATCH  /api/consultations/:id    # تحديث كشف

GET    /api/referrals            # قائمة الإحالات
POST   /api/referrals            # إنشاء إحالة
PATCH  /api/referrals/:id        # تحديث إحالة

GET    /api/notifications        # قائمة الإشعارات
PATCH  /api/notifications/:id/read  # تعليم كمقروء
```

## 🔧 الأوامر المفيدة

### التطوير
```bash
# تشغيل في وضع التطوير
npm run dev

# تشغيل Frontend فقط
npm run dev:client

# Type checking
npm run check

# Linting
npm run lint
npm run lint:fix
```

### قاعدة البيانات
```bash
# تطبيق schema
npm run db:push

# إنشاء migration
npm run db:generate

# تطبيق migrations
npm run db:migrate

# إضافة بيانات تجريبية
npm run db:seed
```

### الاختبار
```bash
# تشغيل الاختبارات
npm test

# مع coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### الإنتاج
```bash
# Build
npm run build

# تشغيل الإنتاج
npm start
```

## 🐛 حل المشاكل الشائعة

### مشكلة: Cannot connect to database

**الحل:**
```bash
# 1. تحقق من .env
cat .env | grep DATABASE_URL

# 2. اختبر الاتصال
psql $DATABASE_URL -c "SELECT 1"

# 3. تحقق من Neon Console
# https://console.neon.tech
```

### مشكلة: Port 5000 already in use

**الحل:**
```bash
# تغيير PORT في .env
PORT=3000

# أو إيقاف العملية الأخرى
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### مشكلة: Module not found

**الحل:**
```bash
# إعادة تثبيت dependencies
rm -rf node_modules package-lock.json
npm install
```

### مشكلة: TypeScript errors

**الحل:**
```bash
# تحديث types
npm run check

# إعادة بناء
npm run build
```

## 📊 التحقق من الحالة

### 1. Database Connection
```bash
# يجب أن ترى في console:
✅ Database connection pool initialized
```

### 2. Server Running
```bash
# يجب أن ترى:
serving on port 5000
```

### 3. Frontend Loading
```bash
# افتح المتصفح وتحقق من:
- الصفحة تحمل بدون أخطاء
- Console خالي من الأخطاء
- Network requests تعمل
```

## 🎯 الخطوات التالية

### للمطورين
1. ✅ راجع `README.md` للتوثيق الكامل
2. ✅ راجع `shared/schema.ts` لفهم Database
3. ✅ راجع `server/routes.ts` لفهم API
4. ✅ راجع `client/src/` لفهم Frontend

### للمسؤولين
1. ✅ سجل دخول كـ System Admin
2. ✅ راجع لوحة التحكم
3. ✅ وافق على العيادات المعلقة
4. ✅ راجع الإحصائيات

### لأصحاب العيادات
1. ✅ سجل عيادة جديدة
2. ✅ أضف أطباء وممرضين
3. ✅ أضف مرضى
4. ✅ احجز مواعيد

## 📚 موارد إضافية

### التوثيق
- `README.md` - التوثيق الكامل
- `NEON_INTEGRATION_SUMMARY.md` - دليل التكامل
- `.kiro/specs/` - المواصفات التفصيلية

### الأدوات
- [Neon Console](https://console.neon.tech) - إدارة قاعدة البيانات
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools) - أدوات React

### المجتمع
- GitHub Issues - للإبلاغ عن المشاكل
- Discord - للدعم المباشر
- Email - support@marktology.com

## ✅ Checklist للبدء

- [ ] Node.js 18+ مثبت
- [ ] npm مثبت
- [ ] Dependencies مثبتة (`npm install`)
- [ ] .env موجود ومحدث
- [ ] Database متصل
- [ ] Server يعمل (`npm run dev`)
- [ ] Frontend يحمل في المتصفح
- [ ] يمكن تسجيل الدخول
- [ ] API endpoints تعمل

## 🎊 مبروك!

أنت الآن جاهز لاستخدام Marktology OS! 🚀

---

**هل تحتاج مساعدة؟**
- راجع `README.md` للتوثيق الكامل
- راجع `NEON_INTEGRATION_SUMMARY.md` للمشاكل الشائعة
- افتح issue على GitHub
- اتصل بالدعم: support@marktology.com

**وقت القراءة:** 5 دقائق  
**وقت التطبيق:** 5 دقائق  
**المجموع:** 10 دقائق للبدء! ⚡
