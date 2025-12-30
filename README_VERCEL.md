# 🏥 Marktology OS - Healthcare Clinic Management System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mars-20/Marktology)

**نظام إدارة عيادات طبية متكامل مبني بتقنيات حديثة**

---

## 🚀 نشر سريع على Vercel

### خطوة واحدة للنشر:

```bash
npm install -g vercel && vercel --prod
```

**أو استخدم زر Deploy أعلاه ↑**

📖 **دليل النشر الكامل:** [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)

---

## ✨ المميزات

### إدارة العيادات
- ✅ تسجيل وإدارة العيادات
- ✅ إدارة الأطباء والموظفين
- ✅ نظام صلاحيات متقدم

### إدارة المرضى
- ✅ ملفات مرضى شاملة
- ✅ سجل طبي كامل
- ✅ تتبع الزيارات والاستشارات

### المواعيد والاستشارات
- ✅ جدولة المواعيد
- ✅ تسجيل الاستشارات
- ✅ متابعة العلاج

### الإحالات والمتابعة
- ✅ نظام إحالة المرضى
- ✅ مهام المتابعة التلقائية
- ✅ تذكيرات وإشعارات

### التحليلات والتقارير
- ✅ لوحة تحكم تحليلية
- ✅ إحصائيات شاملة
- ✅ تقارير مفصلة

### الملفات والاتصالات
- ✅ رفع وإدارة الملفات
- ✅ سجل الاتصالات
- ✅ تكامل مع Cloudinary

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 19** - مكتبة UI حديثة
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - مكونات UI جاهزة
- **TanStack Query** - إدارة البيانات
- **Wouter** - Routing خفيف

### Backend
- **Node.js 20+** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **Passport.js** - Authentication
- **Zod** - Validation

### Database
- **Neon PostgreSQL** - Serverless database
- **Connection Pooling** - للأداء الأفضل
- **Drizzle Kit** - Migrations

### Security
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - DDoS protection
- **Input Sanitization** - XSS protection
- **bcrypt** - Password hashing

### Deployment
- **Vercel** - Serverless platform
- **Fluid Compute** - Advanced execution
- **Global CDN** - Fast delivery
- **Auto-scaling** - Unlimited scale

---

## 📦 التثبيت المحلي

### المتطلبات:
- Node.js 20+
- npm أو yarn
- PostgreSQL (أو حساب Neon)

### الخطوات:

```bash
# 1. استنساخ المشروع
git clone https://github.com/Mars-20/Marktology.git
cd Marktology

# 2. تثبيت Dependencies
npm install

# 3. إعداد Environment Variables
cp .env.example .env
# عدّل .env بالقيم الصحيحة

# 4. تطبيق Database Migrations
npm run db:push

# 5. (اختياري) إضافة بيانات تجريبية
npm run db:seed

# 6. تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: http://localhost:5000

---

## 🔐 Environment Variables

### المطلوبة:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Session
SESSION_SECRET=your-secret-key-32-characters-minimum

# Environment
NODE_ENV=development
PORT=5000
```

### الاختيارية:

```bash
# Cloudinary (للملفات)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ENABLE_FILE_UPLOAD=true

# Error Tracking
SENTRY_DSN=your-sentry-dsn
```

📖 **القائمة الكاملة:** [.env.production.example](./.env.production.example)

---

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch

# تشغيل مع Coverage
npm run test:coverage

# TypeScript Check
npm run check

# Linting
npm run lint
```

### نتائج الاختبارات الحالية:
```
✅ 17/17 Tests Passing
✅ 0 TypeScript Errors
✅ 0 ESLint Errors
✅ Build Successful
```

---

## 📊 الأداء

### Bundle Sizes (بعد التحسين):
```
Main Bundle:    386 KB (gzip: 104 KB)
React Vendor:    12 KB (gzip: 4 KB)
Radix UI:       154 KB (gzip: 42 KB)
Charts:         420 KB (gzip: 113 KB)
Query Client:    33 KB (gzip: 10 KB)
Date Utils:      84 KB (gzip: 21 KB)
```

### تحسينات مطبقة:
- ✅ Code Splitting
- ✅ Tree Shaking
- ✅ Minification
- ✅ Gzip Compression
- ✅ Lazy Loading

---

## 🚀 النشر على Vercel

### الطريقة السريعة:

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر
vercel --prod
```

### الطريقة عبر GitHub:

1. ادفع الكود إلى GitHub
2. اذهب إلى [vercel.com/new](https://vercel.com/new)
3. اختر repository
4. أضف Environment Variables
5. اضغط Deploy

### الأدلة المتوفرة:

- 📖 [دليل سريع (5 دقائق)](./VERCEL_QUICK_START.md)
- 📖 [دليل شامل](./VERCEL_DEPLOYMENT_GUIDE.md)
- 📖 [قائمة التحقق](./DEPLOYMENT_CHECKLIST.md)
- 📖 [ملخص الجاهزية](./VERCEL_DEPLOYMENT_SUMMARY.md)

---

## 📁 هيكل المشروع

```
Marktology/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Backend Express app
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   ├── auth.ts          # Authentication
│   ├── middleware.ts    # Middlewares
│   └── index.ts         # Entry point
├── shared/              # Shared code
│   ├── schema.ts        # Database schema
│   └── types.ts         # TypeScript types
├── api/                 # Vercel serverless
│   └── index.js         # Entry point
├── migrations/          # Database migrations
├── scripts/             # Utility scripts
└── dist/                # Build output
```

---

## 🔒 الأمان

### المطبق:
- ✅ **Password Hashing** - bcrypt
- ✅ **Session Security** - httpOnly, secure cookies
- ✅ **Rate Limiting** - 4 مستويات مختلفة
- ✅ **CORS Protection** - Origins محددة
- ✅ **Security Headers** - Helmet middleware
- ✅ **Input Sanitization** - DOMPurify
- ✅ **SQL Injection Prevention** - Prepared statements
- ✅ **XSS Protection** - Content sanitization

### موصى به للإنتاج:
- CSRF Protection
- 2FA Authentication
- API Key Authentication
- Audit Logging

---

## 📈 المراقبة

### Vercel Built-in:
- ✅ Deployment Logs
- ✅ Runtime Logs
- ✅ Performance Metrics
- ✅ Error Tracking

### اختياري:
- Sentry - Error tracking
- Vercel Analytics - User analytics
- Custom Metrics - Application metrics

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 👥 الفريق

- **المطور:** Mars-20
- **المساعد:** Kiro AI Assistant

---

## 📞 الدعم

### الوثائق:
- 📖 [دليل المستخدم](./docs/USER_GUIDE.md)
- 📖 [دليل المطور](./docs/DEVELOPER_GUIDE.md)
- 📖 [API Documentation](./docs/API.md)

### المجتمع:
- 💬 [GitHub Discussions](https://github.com/Mars-20/Marktology/discussions)
- 🐛 [Report Issues](https://github.com/Mars-20/Marktology/issues)

---

## 🎯 Roadmap

### قريباً:
- [ ] Mobile App (React Native)
- [ ] WhatsApp Integration
- [ ] SMS Notifications
- [ ] Advanced Analytics
- [ ] Multi-language Support

### مستقبلاً:
- [ ] AI-powered Diagnosis Assistant
- [ ] Telemedicine Features
- [ ] Prescription Management
- [ ] Insurance Integration
- [ ] Lab Results Integration

---

## ⭐ Star History

إذا أعجبك المشروع، لا تنسى إضافة ⭐ على GitHub!

---

## 🙏 شكر خاص

- [Vercel](https://vercel.com) - Hosting platform
- [Neon](https://neon.tech) - Serverless Postgres
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM

---

**Built with ❤️ for Healthcare Professionals**

🚀 **[Deploy Now](https://vercel.com/new/clone?repository-url=https://github.com/Mars-20/Marktology)**
