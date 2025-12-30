# 🚀 دليل التشغيل السريع - MVP

## خطوات التشغيل في 5 دقائق

### 1️⃣ تطبيق Database Migration

**استخدم Supabase MCP:**

```typescript
// استخدم هذا الأمر في Kiro
mcp_supabase_apply_migration({
  name: "add_mvp_features",
  query: `
    -- راجع محتوى ملف shared/schema-updates.sql
  `
})
```

**أو استخدم Drizzle:**

```bash
npm run db:push
```

### 2️⃣ دمج الكود الجديد

افتح `server/storage.ts` وأضف في النهاية:

```typescript
// Export MVP additions
export * from './storage-mvp-additions';
```

### 3️⃣ تشغيل السيرفر

```bash
npm run dev
```

### 4️⃣ التحقق من Cron Jobs

ابحث في اللوج عن:
```
[CRON] Starting follow-up scheduler...
[CRON] Follow-up scheduler started successfully
```

### 5️⃣ اختبار الميزات

افتح المتصفح:
```
http://localhost:5000/follow-ups
```

---

## ✅ تم!

الآن لديك:
- ✅ نظام متابعة آلي
- ✅ سجل اتصالات
- ✅ إدارة ملفات
- ✅ Cron Jobs تعمل تلقائياً

---

## 📚 للمزيد

- `MVP_COMPLETE.md` - دليل شامل
- `MVP_SUMMARY_AR.md` - ملخص سريع
- `MVP_COMPLETION_GUIDE.md` - دليل تفصيلي
