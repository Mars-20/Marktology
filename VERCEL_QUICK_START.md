# 🚀 دليل النشر السريع على Vercel

## الخطوات الأساسية (5 دقائق)

### 1️⃣ تحضير قاعدة البيانات Neon

```bash
# 1. اذهب إلى https://console.neon.tech
# 2. أنشئ مشروع جديد أو استخدم الموجود
# 3. انسخ "Pooled Connection String"
# يجب أن يحتوي على: ?pooler=true
```

### 2️⃣ تثبيت Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3️⃣ إضافة Environment Variables

```bash
# في مجلد المشروع
vercel env add DATABASE_URL
# الصق: postgresql://user:pass@ep-xxx.neon.tech/db?pooler=true

vercel env add SESSION_SECRET
# الصق: مفتاح عشوائي 32+ حرف

vercel env add NODE_ENV
# اكتب: production

vercel env add APP_URL
# اكتب: https://your-app.vercel.app

vercel env add ALLOWED_ORIGINS
# اكتب: https://your-app.vercel.app
```

### 4️⃣ النشر

```bash
# نشر Preview للاختبار
vercel

# نشر Production
vercel --prod
```

### 5️⃣ التحقق

```bash
# اختبر Health Check
curl https://your-app.vercel.app/health

# يجب أن ترى:
# {"status":"healthy","database":"connected",...}
```

---

## ⚙️ تفعيل Fluid Compute (موصى به)

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك → **Settings** → **Functions**
3. فعّل **Fluid Compute**
4. أعد النشر: `vercel --prod`

---

## 🔐 Environment Variables المطلوبة

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ نعم | `postgresql://...?pooler=true` |
| `SESSION_SECRET` | ✅ نعم | `32+ random characters` |
| `NODE_ENV` | ✅ نعم | `production` |
| `APP_URL` | ✅ نعم | `https://your-app.vercel.app` |
| `ALLOWED_ORIGINS` | ✅ نعم | `https://your-app.vercel.app` |
| `CLOUDINARY_*` | ❌ اختياري | للملفات فقط |

---

## 🧪 اختبار بعد النشر

```bash
# 1. Health Check
curl https://your-app.vercel.app/health

# 2. API Test
curl https://your-app.vercel.app/api/clinics

# 3. عرض Logs
vercel logs
```

---

## 🚨 استكشاف الأخطاء

### خطأ: "Database connection failed"
```bash
# تأكد من استخدام Pooled Connection
DATABASE_URL=postgresql://...?pooler=true&connect_timeout=10
```

### خطأ: "Session not working"
```bash
# تأكد من SESSION_SECRET (32+ حرف)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### خطأ: "CORS error"
```bash
# أضف النطاق في ALLOWED_ORIGINS
vercel env add ALLOWED_ORIGINS
# اكتب: https://your-app.vercel.app,https://custom-domain.com
```

---

## 📚 المزيد من التفاصيل

راجع الدليل الشامل: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

✅ **جاهز للنشر!**
