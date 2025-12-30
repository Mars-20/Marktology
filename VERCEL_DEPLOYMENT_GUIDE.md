# 🚀 دليل نشر Marktology OS على Vercel

**تاريخ الإعداد:** 30 ديسمبر 2024  
**المنصة:** Vercel Serverless Platform  
**قاعدة البيانات:** Neon Serverless PostgreSQL

---

## 📋 نظرة عامة

هذا الدليل يوضح أفضل الممارسات لنشر تطبيق Marktology OS على منصة Vercel مع قاعدة بيانات Neon PostgreSQL.

### ✅ المميزات الرئيسية لـ Vercel:
- **Fluid Compute:** نموذج تنفيذ متقدم يجمع بين Serverless و Server-like concurrency
- **Auto-scaling:** توسع تلقائي لآلاف الطلبات المتزامنة
- **Zero Configuration:** نشر بدون تكوين معقد
- **Global CDN:** توزيع عالمي للمحتوى الثابت
- **Built-in Monitoring:** مراقبة وسجلات مدمجة
- **Multi-AZ Redundancy:** توفر عالي مع نسخ احتياطي تلقائي

---

## 🎯 الخطوة 1: إعداد ملف vercel.json

أنشئ ملف `vercel.json` في جذر المشروع:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 1024,
      "includeFiles": "dist/**"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🔧 الخطوة 2: تعديل هيكل المشروع للـ Serverless

### 2.1 إنشاء ملف api/index.js

أنشئ مجلد `api` في جذر المشروع وأضف ملف `api/index.js`:

```javascript
// api/index.js
import '../dist/index.js';
```

### 2.2 تعديل server/index.ts

أضف تصدير للـ app في نهاية الملف:

```typescript
// في نهاية server/index.ts
export default app;
```

### 2.3 إنشاء Entry Point للـ Serverless

أنشئ ملف `server/serverless.ts`:

```typescript
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "./auth";
import { registerRoutes } from "./routes";
import { config, getAllowedOrigins } from "./config";
import { apiLimiter } from "./middleware";
import { sanitizeInput } from "./sanitization";

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/api', apiLimiter);

// Session Configuration
const PgSession = connectPgSimple(session);

if (config.DATABASE_URL) {
  app.use(
    session({
      store: new PgSession({
        conString: config.DATABASE_URL,
        tableName: 'sessions',
        createTableIfMissing: true,
      }),
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true, // Always true in production
        sameSite: 'lax',
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input Sanitization
app.use('/api', sanitizeInput);

// Register Routes
(async () => {
  await registerRoutes(null, app);
  
  // Error Handler
  const { errorHandler } = await import('./errorHandler');
  app.use(errorHandler);
})();

// Export for Vercel
export default app;
```

---

## 🗄️ الخطوة 3: تكوين قاعدة البيانات Neon

### 3.1 استخدام Connection Pooling

في Vercel مع Neon، استخدم **Pooled Connection** للأداء الأفضل:

```typescript
// server/storage.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// استخدم DATABASE_URL مع pooling
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
```

### 3.2 الحصول على Connection String من Neon

1. افتح لوحة تحكم Neon: https://console.neon.tech
2. اختر مشروعك
3. انسخ **Pooled Connection String** (ليس Direct Connection)
4. يجب أن يكون بالشكل:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&pooler=true
   ```

---

## 🔐 الخطوة 4: إعداد Environment Variables

### 4.1 المتغيرات المطلوبة في Vercel

اذهب إلى **Project Settings → Environment Variables** وأضف:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&pooler=true

# Session
SESSION_SECRET=your-super-secret-key-min-32-characters-long-random-string

# Environment
NODE_ENV=production

# App Configuration
PORT=3000
APP_URL=https://your-app.vercel.app

# Allowed Origins (للـ CORS)
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com

# Cloudinary (اختياري - لرفع الملفات)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-preset

# File Upload (اختياري)
ENABLE_FILE_UPLOAD=true
MAX_FILE_SIZE=10485760

# Error Tracking (اختياري)
SENTRY_DSN=your-sentry-dsn
```

### 4.2 توليد SESSION_SECRET آمن

استخدم هذا الأمر لتوليد مفتاح عشوائي:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 الخطوة 5: تحديث package.json

أضف scripts للنشر:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.js",
    "vercel-build": "npm run build",
    "postinstall": "drizzle-kit generate || true"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 🚀 الخطوة 6: النشر على Vercel

### الطريقة 1: عبر Vercel CLI (موصى بها)

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. ربط المشروع
vercel link

# 4. إضافة Environment Variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
# ... أضف باقي المتغيرات

# 5. النشر للـ Preview
vercel

# 6. النشر للـ Production
vercel --prod
```

### الطريقة 2: عبر GitHub Integration

1. ادفع الكود إلى GitHub
2. اذهب إلى https://vercel.com/new
3. اختر repository الخاص بك
4. أضف Environment Variables
5. اضغط Deploy

---

## ⚡ الخطوة 7: تفعيل Fluid Compute (موصى به)

Fluid Compute يحسن الأداء بشكل كبير:

1. اذهب إلى **Project Settings → Functions**
2. فعّل **Fluid Compute**
3. أعد النشر

### المميزات:
- ✅ معالجة طلبات متعددة في instance واحد
- ✅ تقليل Cold Starts
- ✅ تحسين استهلاك الموارد
- ✅ أداء أفضل للـ I/O operations

---

## 🔍 الخطوة 8: تكوين Monitoring & Logging

### 8.1 Vercel Logs

الوصول للسجلات:
```bash
# عرض logs مباشرة
vercel logs

# عرض logs لـ deployment معين
vercel logs [deployment-url]
```

### 8.2 إضافة Sentry (اختياري)

```bash
npm install @sentry/node @sentry/react
```

```typescript
// server/index.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
```

---

## 🛡️ الخطوة 9: تحسينات الأمان للإنتاج

### 9.1 تحديث CORS Origins

```typescript
// server/config.ts
export function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // في الإنتاج، استخدم فقط النطاقات المحددة
  if (config.NODE_ENV === 'production') {
    return origins.filter(origin => origin.trim());
  }
  
  // في التطوير، اسمح بـ localhost
  return [...origins, 'http://localhost:5000', 'http://localhost:3000'];
}
```

### 9.2 تفعيل Security Headers

```typescript
// server/index.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

---

## 📊 الخطوة 10: تحسين الأداء

### 10.1 Caching Strategy

```typescript
// server/routes.ts
app.get('/api/public-data', (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.json({ data: 'cached data' });
});
```

### 10.2 Database Connection Pooling

```typescript
// server/storage.ts
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🧪 الخطوة 11: الاختبار قبل الإنتاج

### 11.1 اختبار Preview Deployment

```bash
# نشر preview
vercel

# اختبر الـ URL المعطى
curl https://your-app-preview.vercel.app/health
```

### 11.2 Checklist قبل Production

- [ ] جميع Environment Variables مضافة
- [ ] DATABASE_URL يستخدم pooled connection
- [ ] SESSION_SECRET تم تغييره (32+ حرف)
- [ ] ALLOWED_ORIGINS محدد بدقة
- [ ] Health check endpoint يعمل: `/health`
- [ ] Rate limiting مفعّل
- [ ] CORS مكوّن بشكل صحيح
- [ ] Security headers مفعّلة
- [ ] Logs تعمل بشكل صحيح
- [ ] Database migrations مطبقة

---

## 🔄 الخطوة 12: CI/CD مع GitHub Actions (اختياري)

أنشئ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 الخطوة 13: Monitoring & Analytics

### 13.1 Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// client/src/main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 13.2 Custom Metrics

```typescript
// server/middleware.ts
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    }));
  });
  
  next();
}
```

---

## 🚨 استكشاف الأخطاء الشائعة

### مشكلة: Cold Start بطيء

**الحل:**
- فعّل Fluid Compute
- قلل حجم dependencies
- استخدم dynamic imports

### مشكلة: Database Connection Timeout

**الحل:**
```typescript
// استخدم pooled connection
DATABASE_URL=postgresql://...?pooler=true&connect_timeout=10
```

### مشكلة: Session لا تعمل

**الحل:**
```typescript
// تأكد من cookie settings
cookie: {
  secure: true, // HTTPS only
  sameSite: 'lax',
  domain: '.your-domain.com', // للـ subdomains
}
```

### مشكلة: CORS Errors

**الحل:**
```typescript
// أضف جميع النطاقات المطلوبة
ALLOWED_ORIGINS=https://app.vercel.app,https://custom-domain.com
```

---

## 📚 موارد إضافية

### الوثائق الرسمية:
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel + Neon Integration](https://vercel.com/integrations/neon)

### أفضل الممارسات:
- [Serverless Best Practices](https://vercel.com/docs/functions/serverless-functions)
- [Database Connection Pooling](https://neon.tech/docs/guides/vercel-connection-methods)
- [Security Headers](https://vercel.com/docs/security/headers)

---

## ✅ Checklist النشر النهائي

### قبل النشر:
- [ ] تم اختبار التطبيق محلياً
- [ ] جميع الاختبارات تنجح (17/17)
- [ ] TypeScript بدون أخطاء
- [ ] Build ينجح بدون warnings
- [ ] Environment variables جاهزة
- [ ] Database migrations مطبقة على Neon

### أثناء النشر:
- [ ] إنشاء vercel.json
- [ ] إضافة Environment Variables في Vercel
- [ ] ربط GitHub repository
- [ ] نشر Preview للاختبار
- [ ] اختبار جميع endpoints
- [ ] التحقق من /health endpoint

### بعد النشر:
- [ ] مراقبة Logs لمدة 24 ساعة
- [ ] اختبار جميع الميزات
- [ ] التحقق من الأداء
- [ ] إعداد Monitoring & Alerts
- [ ] توثيق الـ Production URL
- [ ] إعداد Custom Domain (اختياري)

---

## 🎉 الخلاصة

باتباع هذا الدليل، ستتمكن من نشر Marktology OS على Vercel بأفضل الممارسات:

✅ **أداء عالي** مع Fluid Compute  
✅ **أمان محسّن** مع Security Headers  
✅ **توفر عالي** مع Multi-AZ Redundancy  
✅ **توسع تلقائي** لآلاف المستخدمين  
✅ **مراقبة شاملة** مع Logs & Analytics  

---

**تم الإعداد بواسطة:** Kiro AI Assistant  
**التاريخ:** 30 ديسمبر 2024  
**الإصدار:** 1.0

🚀 **جاهز للنشر على Vercel!**
