# 🏥 Marktology OS - نظام إدارة العيادات الطبية

نظام متكامل لإدارة العيادات الطبية مبني على تقنيات حديثة مع قاعدة بيانات Neon Serverless PostgreSQL.

## 🌟 المميزات

### للأطباء
- 📋 لوحة تحكم شاملة
- 👥 إدارة المرضى والسجلات الطبية
- 📅 جدولة المواعيد
- 💊 تسجيل الكشوفات والوصفات الطبية
- 🔄 نظام الإحالات بين الأطباء
- 🔔 تنبيهات المتابعة التلقائية

### للعيادات
- 🏢 تسجيل وإدارة العيادات
- 👨‍⚕️ إدارة الأطباء والممرضين
- 📊 تقارير وإحصائيات شاملة
- 🔐 نظام صلاحيات متقدم
- 💾 نسخ احتياطي تلقائي

### للمسؤولين
- 🎛️ لوحة تحكم النظام
- ✅ الموافقة على العيادات الجديدة
- 📈 إحصائيات المنصة
- 🔧 إدارة المستخدمين

## 🚀 التقنيات المستخدمة

### Frontend
- **React 19** - مكتبة UI حديثة
- **TypeScript** - للكتابة الآمنة
- **Tailwind CSS** - للتصميم السريع
- **Wouter** - للتوجيه
- **React Query** - لإدارة البيانات
- **Shadcn/ui** - مكونات UI جاهزة

### Backend
- **Node.js** - بيئة التشغيل
- **Express** - إطار عمل الخادم
- **TypeScript** - للكتابة الآمنة
- **Drizzle ORM** - للتعامل مع قاعدة البيانات
- **Passport.js** - للمصادقة
- **Bcrypt** - لتشفير كلمات المرور

### Database
- **Neon PostgreSQL** - قاعدة بيانات Serverless
- **Connection Pooling** - لتحسين الأداء
- **Automatic Backups** - نسخ احتياطي تلقائي
- **Point-in-time Recovery** - استرجاع نقطة زمنية
- **Database Branching** - فروع للتطوير الآمن

## 📦 التثبيت

### المتطلبات
- Node.js 18+ 
- npm أو yarn
- حساب Neon Database

### الخطوات

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd marktology-os
```

2. **تثبيت Dependencies**
```bash
npm install
```

3. **إعداد البيئة**
```bash
# نسخ ملف البيئة
cp .env.example .env

# تحديث DATABASE_URL في .env
# احصل على connection string من Neon Console
```

4. **تطبيق Schema**
```bash
npm run db:push
```

5. **تشغيل التطبيق**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔧 التكوين

### ملف .env

```env
# Neon Database
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Session
SESSION_SECRET=your-secret-key-change-in-production

# Server
NODE_ENV=development
PORT=5000

# Application
APP_NAME=Marktology OS
APP_URL=http://localhost:5000
```

### Database Schema

يستخدم المشروع Drizzle ORM مع schema محدد في `shared/schema.ts`:

- **clinics** - معلومات العيادات
- **users** - المستخدمين (أطباء، ممرضين، مسؤولين)
- **patients** - المرضى
- **appointments** - المواعيد
- **consultations** - الكشوفات الطبية
- **referrals** - الإحالات
- **notifications** - الإشعارات

## 📚 البنية

```
marktology-os/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # مكونات UI
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── hooks/         # React hooks
│   │   ├── lib/           # مكتبات مساعدة
│   │   └── types/         # TypeScript types
│   └── index.html
├── server/                # Backend Express
│   ├── auth.ts           # نظام المصادقة
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database layer
│   ├── middleware.ts     # Express middleware
│   └── utils/            # دوال مساعدة
├── shared/               # مشترك بين Frontend و Backend
│   ├── schema.ts         # Database schema
│   └── types.ts          # TypeScript types
├── .kiro/                # Kiro specs
│   └── specs/
│       └── neon-saas-integration/
└── migrations/           # Database migrations
```

## 🔐 الأمان

### تم تطبيقه
- ✅ تشفير كلمات المرور (bcrypt)
- ✅ SSL/TLS للاتصالات
- ✅ Session management آمن
- ✅ Input validation (Zod)
- ✅ Prepared statements (SQL injection prevention)
- ✅ CORS configuration

### موصى به للإنتاج
- ⚠️ Row-Level Security (RLS)
- ⚠️ Rate limiting
- ⚠️ IP whitelisting
- ⚠️ Audit logging
- ⚠️ 2FA authentication
- ⚠️ HTTPS only

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع coverage
npm run test:coverage

# تشغيل الاختبارات في watch mode
npm run test:watch

# Linting
npm run lint

# Type checking
npm run check
```

## 📊 الأداء

### Database Optimization
- Connection pooling (max 20 connections)
- Indexes على الحقول المهمة
- Prepared statements
- Query optimization

### Frontend Optimization
- Code splitting
- Lazy loading
- React Query caching
- Optimized bundle size

## 🚀 النشر

### Neon Database
1. إنشاء project في [Neon Console](https://console.neon.tech)
2. نسخ connection string
3. تحديث DATABASE_URL في .env

### Application Deployment
```bash
# Build للإنتاج
npm run build

# تشغيل الإنتاج
NODE_ENV=production npm start
```

### Environment Variables
تأكد من تعيين جميع المتغيرات المطلوبة:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `PORT`

## 📖 التوثيق

### API Documentation
جميع API endpoints موثقة في `server/routes.ts`

### Database Schema
Schema كامل في `shared/schema.ts`

### Integration Guide
دليل التكامل الشامل في `.kiro/specs/neon-saas-integration/`

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📝 الترخيص

MIT License - انظر ملف LICENSE للتفاصيل

## 🆘 الدعم

### المشاكل الشائعة
راجع `NEON_INTEGRATION_SUMMARY.md` للحلول

### الموارد
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [React Documentation](https://react.dev)

### الاتصال
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@marktology.com

## 🎯 خارطة الطريق

### الإصدار الحالي (v1.0)
- ✅ إدارة العيادات والمستخدمين
- ✅ إدارة المرضى
- ✅ جدولة المواعيد
- ✅ الكشوفات الطبية
- ✅ نظام الإحالات
- ✅ الإشعارات

### الإصدارات القادمة
- 📋 نظام التقارير المتقدم
- 💰 نظام الفواتير والمدفوعات
- 📱 تطبيق موبايل
- 🔔 إشعارات SMS/WhatsApp
- 📊 لوحة تحليلات متقدمة
- 🌐 دعم متعدد اللغات

## 🙏 شكر وتقدير

- [Neon](https://neon.tech) - قاعدة البيانات Serverless
- [Drizzle ORM](https://orm.drizzle.team) - ORM حديث
- [Shadcn/ui](https://ui.shadcn.com) - مكونات UI
- [React](https://react.dev) - مكتبة UI

---

**صنع بـ ❤️ في مصر**

**الإصدار:** 1.0.0  
**آخر تحديث:** 30 ديسمبر 2024
