# ✅ Checklist النشر على Vercel

## 📋 قبل النشر

### التحقق من الكود
- [ ] جميع الاختبارات تنجح: `npm test`
- [ ] TypeScript بدون أخطاء: `npm run check`
- [ ] Build ينجح: `npm run build`
- [ ] ESLint بدون أخطاء: `npm run lint`

### إعداد الملفات
- [x] ملف `vercel.json` موجود
- [x] مجلد `api/` مع `index.js` موجود
- [x] `package.json` يحتوي على `vercel-build` script
- [x] `package.json` يحتوي على `engines.node >= 20`
- [x] `.env.production.example` موجود كمرجع

---

## 🗄️ إعداد قاعدة البيانات

### Neon PostgreSQL
- [ ] حساب Neon مُنشأ: https://console.neon.tech
- [ ] مشروع Neon مُنشأ
- [ ] Database مُنشأة
- [ ] **Pooled Connection String** منسوخ
- [ ] Connection String يحتوي على `?pooler=true`
- [ ] Migrations مطبقة على قاعدة البيانات

### تطبيق Migrations
```bash
# محلياً (للتأكد)
npm run db:push

# أو استخدم Neon SQL Editor
# انسخ محتوى migrations/*.sql
```

---

## 🔐 Environment Variables

### المتغيرات المطلوبة (✅ Required)

#### 1. DATABASE_URL
```bash
vercel env add DATABASE_URL
# الصق: postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require&pooler=true
```
- [ ] تم إضافة DATABASE_URL
- [ ] يحتوي على `?pooler=true`
- [ ] تم اختباره (يعمل)

#### 2. SESSION_SECRET
```bash
# ولّد مفتاح عشوائي
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add SESSION_SECRET
# الصق المفتاح المولّد
```
- [ ] تم إضافة SESSION_SECRET
- [ ] طوله 32+ حرف
- [ ] عشوائي وآمن

#### 3. NODE_ENV
```bash
vercel env add NODE_ENV
# اكتب: production
```
- [ ] تم إضافة NODE_ENV=production

#### 4. APP_URL
```bash
vercel env add APP_URL
# اكتب: https://your-app.vercel.app
```
- [ ] تم إضافة APP_URL
- [ ] يطابق Vercel domain

#### 5. ALLOWED_ORIGINS
```bash
vercel env add ALLOWED_ORIGINS
# اكتب: https://your-app.vercel.app
# أو: https://app1.com,https://app2.com
```
- [ ] تم إضافة ALLOWED_ORIGINS
- [ ] يحتوي على جميع النطاقات المطلوبة

### المتغيرات الاختيارية (❌ Optional)

#### Cloudinary (للملفات)
```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add CLOUDINARY_UPLOAD_PRESET
vercel env add ENABLE_FILE_UPLOAD
# اكتب: true
```
- [ ] تم إضافة Cloudinary credentials (إذا لزم)
- [ ] تم اختبار رفع الملفات

#### Error Tracking
```bash
vercel env add SENTRY_DSN
# الصق: https://xxx@sentry.io/xxx
```
- [ ] تم إضافة SENTRY_DSN (إذا لزم)

---

## 🚀 النشر

### الطريقة 1: Vercel CLI (موصى بها)

```bash
# 1. تثبيت CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. ربط المشروع
vercel link

# 4. نشر Preview
vercel

# 5. اختبار Preview URL
curl https://your-app-xxx.vercel.app/health

# 6. نشر Production
vercel --prod
```

- [ ] Vercel CLI مثبت
- [ ] تم تسجيل الدخول
- [ ] تم ربط المشروع
- [ ] Preview deployment نجح
- [ ] تم اختبار Preview
- [ ] Production deployment نجح

### الطريقة 2: GitHub Integration

```bash
# 1. ادفع الكود إلى GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# 2. اذهب إلى Vercel Dashboard
# https://vercel.com/new

# 3. اختر GitHub repository
# 4. أضف Environment Variables
# 5. اضغط Deploy
```

- [ ] الكود مدفوع إلى GitHub
- [ ] Repository متصل بـ Vercel
- [ ] Environment Variables مضافة
- [ ] Auto-deployment مفعّل

---

## ⚡ تحسينات الأداء

### Fluid Compute
- [ ] تم تفعيل Fluid Compute في Project Settings
- [ ] تم إعادة النشر بعد التفعيل

### Regions
- [ ] تم اختيار Region الأقرب للمستخدمين
- [ ] (افتراضي: `iad1` - US East)

---

## 🧪 الاختبار بعد النشر

### Health Check
```bash
curl https://your-app.vercel.app/health
```
- [ ] `/health` يعمل
- [ ] Response: `{"status":"healthy","database":"connected"}`

### API Endpoints
```bash
# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```
- [ ] `/api/auth/login` يعمل
- [ ] Rate limiting يعمل (بعد 5 محاولات)

### Frontend
```bash
# افتح في المتصفح
https://your-app.vercel.app
```
- [ ] الصفحة الرئيسية تحمل
- [ ] Assets تحمل بشكل صحيح
- [ ] لا توجد أخطاء في Console

### Database
```bash
# اختبر قراءة البيانات
curl https://your-app.vercel.app/api/clinics
```
- [ ] Database connection يعمل
- [ ] Queries تنفذ بنجاح
- [ ] Pooling يعمل بشكل صحيح

---

## 📊 المراقبة

### Vercel Logs
```bash
# عرض logs مباشرة
vercel logs

# عرض logs لـ deployment معين
vercel logs [deployment-url]
```
- [ ] Logs تعمل بشكل صحيح
- [ ] لا توجد أخطاء في Logs

### Vercel Analytics
- [ ] تم تفعيل Analytics في Dashboard
- [ ] Metrics تظهر بشكل صحيح

### Error Tracking (إذا تم إعداده)
- [ ] Sentry يستقبل الأخطاء
- [ ] Alerts مكوّنة

---

## 🔒 الأمان

### Security Headers
- [ ] Helmet middleware مفعّل
- [ ] CSP headers مكوّنة
- [ ] CORS مكوّن بشكل صحيح

### Rate Limiting
- [ ] Rate limiters مفعّلة
- [ ] تم اختبار Rate limiting

### Authentication
- [ ] Sessions تعمل بشكل صحيح
- [ ] Cookies آمنة (secure, httpOnly)
- [ ] Password hashing يعمل

---

## 📝 التوثيق

### URLs
- [ ] Production URL موثّق
- [ ] API Documentation محدّثة
- [ ] Environment Variables موثّقة

### Team Communication
- [ ] الفريق على علم بالنشر
- [ ] Credentials مشاركة بشكل آمن
- [ ] Rollback plan موثّق

---

## 🚨 خطة الطوارئ

### Rollback
```bash
# العودة لـ deployment سابق
vercel rollback [deployment-url]
```
- [ ] تم توثيق آخر deployment مستقر
- [ ] الفريق يعرف كيفية Rollback

### Monitoring
- [ ] تم إعداد Alerts للأخطاء
- [ ] تم إعداد Uptime monitoring
- [ ] شخص مسؤول عن المراقبة

---

## ✅ النشر مكتمل!

### Post-Deployment Tasks
- [ ] تم إرسال إشعار للفريق
- [ ] تم تحديث Documentation
- [ ] تم جدولة مراجعة بعد 24 ساعة
- [ ] تم توثيق أي مشاكل واجهتها

### Next Steps
- [ ] إعداد Custom Domain (اختياري)
- [ ] إعداد SSL Certificate (تلقائي مع Vercel)
- [ ] إعداد Monitoring متقدم
- [ ] تحسين Performance بناءً على Metrics

---

## 📞 الدعم

### إذا واجهت مشاكل:

1. **راجع Logs:**
   ```bash
   vercel logs
   ```

2. **راجع الأدلة:**
   - [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)
   - [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

3. **Vercel Support:**
   - https://vercel.com/support
   - https://vercel.com/docs

4. **Neon Support:**
   - https://neon.tech/docs
   - https://neon.tech/discord

---

**تاريخ آخر تحديث:** 30 ديسمبر 2024  
**الإصدار:** 1.0  

🎉 **مبروك! تطبيقك الآن على Vercel!**
