# Design Document - Marktology OS Complete Features

## Overview

This design document outlines the architecture and implementation approach for completing the Marktology OS clinic management system. The system will be built using a modern tech stack with React 19 frontend, Node.js/Express backend, and Neon PostgreSQL database.

The design focuses on creating a production-ready system with 20 major features including follow-up management, comprehensive patient profiles, billing, reporting, enhanced notifications, and more.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React 19)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Patients │  │Appointments│ │ Reports  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Follow-ups│  │ Billing  │  │Referrals │  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Server Layer (Express)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Routes  │  │Middleware│  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Storage  │  │ Services │  │ Handlers │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (Neon PostgreSQL)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Clinics  │  │  Users   │  │ Patients │  │Appointments│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Consult.  │  │Referrals │  │ Invoices │  │  Files   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for data fetching
- Wouter for routing
- Zod for validation

**Backend:**
- Node.js with Express
- TypeScript
- Drizzle ORM
- Passport.js for authentication
- Bcrypt for password hashing

**Database:**
- Neon PostgreSQL (Serverless)
- Connection pooling
- Automatic backups

## Components and Interfaces

### 1. Follow-up System Components

#### FollowUpManager
```typescript
interface FollowUpManager {
  createFollowUp(consultationId: string, followUpData: FollowUpData): Promise<FollowUp>;
  getFollowUps(filters: FollowUpFilters): Promise<FollowUp[]>;
  markFollowUpComplete(followUpId: string, notes: string): Promise<FollowUp>;
  getOverdueFollowUps(doctorId: string): Promise<FollowUp[]>;
}

interface FollowUpData {
  patient_id: string;
  doctor_id: string;
  consultation_id: string;
  follow_up_date: Date;
  follow_up_type: 'phone_call' | 'visit' | 'test_results';
  reason: string;
  notes?: string;
}

interface FollowUp {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id: string;
  follow_up_date: Date;
  follow_up_type: string;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  completed_at?: Date;
  completion_notes?: string;
  created_at: Date;
}
```

#### FollowUpDashboard Component
```typescript
interface FollowUpDashboardProps {
  doctorId: string;
}

// Displays:
// - Today's follow-ups
// - Overdue follow-ups (highlighted)
// - Upcoming follow-ups
// - Completed follow-ups
```

### 2. Patient Profile Components

#### PatientProfilePage
```typescript
interface PatientProfilePageProps {
  patientId: string;
}

// Sections:
// - Patient Info Card
// - Medical History Tab
// - Visits Timeline Tab
// - Files Tab
// - Quick Actions (New Appointment, New Consultation, Refer)
```

#### PatientTimeline
```typescript
interface PatientTimelineProps {
  patientId: string;
}

interface TimelineEvent {
  id: string;
  type: 'consultation' | 'appointment' | 'referral' | 'file_upload';
  date: Date;
  title: string;
  description: string;
  metadata: Record<string, any>;
}
```

#### MedicalHistoryManager
```typescript
interface MedicalHistoryManager {
  addChronicDisease(patientId: string, disease: string): Promise<void>;
  addAllergy(patientId: string, allergy: string): Promise<void>;
  addSurgery(patientId: string, surgery: SurgeryData): Promise<void>;
  addFamilyHistory(patientId: string, history: FamilyHistoryData): Promise<void>;
  addCurrentMedication(patientId: string, medication: MedicationData): Promise<void>;
  getMedicalHistory(patientId: string): Promise<MedicalHistory>;
}
```

### 3. Billing System Components

#### InvoiceManager
```typescript
interface InvoiceManager {
  createInvoice(invoiceData: InvoiceData): Promise<Invoice>;
  getInvoices(filters: InvoiceFilters): Promise<Invoice[]>;
  updateInvoiceStatus(invoiceId: string, status: PaymentStatus): Promise<Invoice>;
  recordPayment(invoiceId: string, payment: PaymentData): Promise<Payment>;
  printInvoice(invoiceId: string): Promise<Blob>;
}

interface InvoiceData {
  clinic_id: string;
  patient_id: string;
  consultation_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'insurance';
  payment_status: 'paid' | 'pending' | 'partial';
}

interface Invoice {
  id: string;
  invoice_number: string;
  clinic_id: string;
  patient_id: string;
  consultation_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  payment_method: string;
  payment_status: string;
  issued_date: Date;
  due_date: Date;
  created_at: Date;
}
```

### 4. Reporting System Components

#### ReportGenerator
```typescript
interface ReportGenerator {
  generateDailyReport(clinicId: string, date: Date): Promise<DailyReport>;
  generateWeeklyReport(clinicId: string, startDate: Date): Promise<WeeklyReport>;
  generateMonthlyReport(clinicId: string, month: number, year: number): Promise<MonthlyReport>;
  generateRevenueReport(clinicId: string, filters: RevenueFilters): Promise<RevenueReport>;
  generateDoctorPerformanceReport(doctorId: string, filters: PerformanceFilters): Promise<PerformanceReport>;
  exportReport(reportId: string, format: 'pdf' | 'excel'): Promise<Blob>;
}

interface DailyReport {
  date: Date;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  total_patients_seen: number;
  total_revenue: number;
  payment_methods_breakdown: Record<string, number>;
}
```

### 5. Enhanced Notification System

#### NotificationManager
```typescript
interface NotificationManager {
  createNotification(notificationData: NotificationData): Promise<Notification>;
  getNotifications(userId: string, filters: NotificationFilters): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): void;
}

interface NotificationData {
  user_id: string;
  type: 'appointment' | 'referral' | 'follow_up' | 'system' | 'alert';
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  priority: 'low' | 'medium' | 'high';
}
```

### 6. File Management System

#### FileManager
```typescript
interface FileManager {
  uploadFile(patientId: string, file: File, metadata: FileMetadata): Promise<PatientFile>;
  getFiles(patientId: string, filters: FileFilters): Promise<PatientFile[]>;
  downloadFile(fileId: string): Promise<Blob>;
  deleteFile(fileId: string): Promise<void>;
  getStorageUsed(patientId: string): Promise<number>;
}

interface FileMetadata {
  file_type: 'lab_result' | 'xray' | 'report' | 'other';
  description?: string;
  uploaded_by: string;
}

interface PatientFile {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: Date;
}
```

### 7. Search System

#### SearchManager
```typescript
interface SearchManager {
  globalSearch(query: string, filters: SearchFilters): Promise<SearchResults>;
  searchPatients(query: string, clinicId: string): Promise<Patient[]>;
  searchAppointments(query: string, filters: AppointmentSearchFilters): Promise<Appointment[]>;
  searchConsultations(query: string, filters: ConsultationSearchFilters): Promise<Consultation[]>;
}

interface SearchResults {
  patients: Patient[];
  appointments: Appointment[];
  consultations: Consultation[];
  total: number;
}
```

## Data Models

### New Database Tables

#### follow_ups Table
```sql
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('phone_call', 'visit', 'test_results')),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMP,
  completion_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_follow_ups_patient ON follow_ups(patient_id);
CREATE INDEX idx_follow_ups_doctor ON follow_ups(doctor_id);
CREATE INDEX idx_follow_ups_date ON follow_ups(follow_up_date);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
```

#### medical_history Table
```sql
CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  chronic_diseases TEXT[],
  allergies TEXT[],
  previous_surgeries JSONB,
  family_history JSONB,
  current_medications JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
```

#### invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'insurance')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(issued_date);
```

#### payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number VARCHAR(100),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

#### patient_files Table
```sql
CREATE TABLE patient_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('lab_result', 'xray', 'report', 'other')),
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_files_patient ON patient_files(patient_id);
CREATE INDEX idx_patient_files_type ON patient_files(file_type);
```

#### communication_logs Table
```sql
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('phone_call', 'sms', 'whatsapp', 'email')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('successful', 'failed', 'no_answer')),
  duration INTEGER,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communication_logs_patient ON communication_logs(patient_id);
CREATE INDEX idx_communication_logs_user ON communication_logs(user_id);
CREATE INDEX idx_communication_logs_date ON communication_logs(created_at);
```

#### reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'revenue', 'performance')),
  report_data JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  generated_by UUID NOT NULL REFERENCES users(id),
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_clinic ON reports(clinic_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_date ON reports(start_date, end_date);
```

### Extended Existing Tables

#### consultations Table (Add follow-up fields)
```sql
ALTER TABLE consultations 
ADD COLUMN follow_up_days INTEGER,
ADD COLUMN follow_up_date DATE,
ADD COLUMN follow_up_type VARCHAR(50);
```

#### users Table (Add preferences)
```sql
ALTER TABLE users
ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}',
ADD COLUMN profile_picture_url TEXT,
ADD COLUMN working_hours JSONB;
```

#### clinics Table (Add settings)
```sql
ALTER TABLE clinics
ADD COLUMN settings JSONB DEFAULT '{"appointment_duration": 30, "working_hours": {}}',
ADD COLUMN logo_url TEXT;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Follow-up System Properties

**Property 1: Follow-up Creation**
*For any* completed consultation with follow-up data, creating a follow-up SHALL result in a follow-up record with the correct patient, doctor, date, and type.
**Validates: Requirements 1.1**

**Property 2: Follow-up Notification Generation**
*For any* follow-up with a date that has been reached or passed, the system SHALL have created a notification for the assigned doctor.
**Validates: Requirements 1.2**

**Property 3: Follow-up Data Completeness**
*For any* follow-up record, it SHALL contain patient name, last visit date, follow-up reason, and follow-up type.
**Validates: Requirements 1.3**

**Property 4: Follow-up Completion**
*For any* follow-up, when marked as completed, its status SHALL change to 'completed' and completion_at timestamp SHALL be set.
**Validates: Requirements 1.4**

**Property 5: Follow-up Type Validation**
*For any* follow-up creation request, the system SHALL accept only valid follow-up types ('phone_call', 'visit', 'test_results') and reject invalid types.
**Validates: Requirements 1.5**

**Property 6: Overdue Follow-up Identification**
*For any* follow-up with a date before today and status 'pending', it SHALL be identified as overdue.
**Validates: Requirements 1.6**

### Patient Profile Properties

**Property 7: Patient Data Retrieval**
*For any* patient ID, fetching the patient profile SHALL return all basic information fields (full_name, date_of_birth, gender, phone, email, address, blood_type).
**Validates: Requirements 2.1**

**Property 8: Visit Timeline Ordering**
*For any* patient, the visits timeline SHALL be ordered chronologically by consultation_date in descending order (most recent first).
**Validates: Requirements 2.2**

**Property 9: Consultation Data Completeness**
*For any* consultation in visit history, it SHALL contain diagnosis, treatment, and prescription fields.
**Validates: Requirements 2.3**

**Property 10: File Upload and Retrieval**
*For any* uploaded file, it SHALL be retrievable with correct metadata (file_name, file_type, file_size, uploaded_by, uploaded_at).
**Validates: Requirements 2.4**

**Property 11: Medical History Inclusion**
*For any* patient profile, it SHALL include medical history with chronic diseases and allergies.
**Validates: Requirements 2.5**

**Property 12: Current Medications Display**
*For any* patient with medical history, current medications SHALL be included in the medical history data.
**Validates: Requirements 2.6**

**Property 13: Patient Update Persistence**
*For any* patient update operation, the changes SHALL be persisted and retrievable in subsequent queries.
**Validates: Requirements 2.8**

**Property 14: Patient Statistics Accuracy**
*For any* patient, statistics (total visits, last visit date, upcoming appointments) SHALL be calculated correctly from actual data.
**Validates: Requirements 2.9**

### Billing System Properties

**Property 15: Invoice Creation from Consultation**
*For any* completed consultation, creating an invoice SHALL include consultation_id and patient_id from the consultation.
**Validates: Requirements 3.1**

**Property 16: Payment Method Validation**
*For any* invoice creation, the system SHALL accept only valid payment methods ('cash', 'card', 'insurance') and reject invalid methods.
**Validates: Requirements 3.2**

**Property 17: Invoice Payment Status**
*For any* invoice, it SHALL have a valid payment status ('paid', 'pending', 'partial') at all times.
**Validates: Requirements 3.3**

**Property 18: Revenue Calculation Accuracy**
*For any* time period (day, week, month), the calculated revenue SHALL equal the sum of all invoice totals with payment_status 'paid' or 'partial' within that period.
**Validates: Requirements 3.5**

**Property 19: Financial Report Completeness**
*For any* financial report, it SHALL contain total revenue, pending payments amount, and payment methods breakdown.
**Validates: Requirements 3.6**

**Property 20: Invoice Search Filtering**
*For any* invoice search with filters (patient, date, status), the results SHALL contain only invoices matching all specified filters.
**Validates: Requirements 3.7**

**Property 21: Partial Payment Tracking**
*For any* invoice with partial payment, amount_paid + amount_due SHALL equal total, and payment_status SHALL be 'partial' when 0 < amount_paid < total.
**Validates: Requirements 3.8**

### Reporting System Properties

**Property 22: Report Date Range Accuracy**
*For any* report generation request with date range, the report SHALL include only data within the specified start_date and end_date (inclusive).
**Validates: Requirements 4.1**

**Property 23: Visit Statistics Calculation**
*For any* report, patient visit statistics SHALL equal the count of consultations within the report period.
**Validates: Requirements 4.2**

**Property 24: Revenue Data Accuracy**
*For any* revenue report, the revenue data SHALL match the sum of invoice totals for the specified period.
**Validates: Requirements 4.3**

**Property 25: Doctor Performance Metrics**
*For any* doctor performance report, metrics (patients seen, consultations completed) SHALL be calculated from actual consultation records.
**Validates: Requirements 4.4**

**Property 26: Diagnosis Frequency Calculation**
*For any* report period, the most common diagnoses SHALL be ordered by frequency (count) in descending order.
**Validates: Requirements 4.5**

**Property 27: Appointment Statistics Accuracy**
*For any* report, appointment statistics SHALL correctly count appointments by status (scheduled, completed, cancelled, no_show).
**Validates: Requirements 4.6**

**Property 28: Patient Demographics Calculation**
*For any* demographics report, age distribution and gender distribution SHALL be calculated correctly from patient records.
**Validates: Requirements 4.8**

**Property 29: Follow-up Completion Rate**
*For any* period, follow-up completion rate SHALL equal (completed follow-ups / total follow-ups) * 100.
**Validates: Requirements 4.9**


### Notification System Properties

**Property 30: Appointment Notification Creation**
*For any* new appointment creation, a notification SHALL be created for the assigned doctor with type 'appointment'.
**Validates: Requirements 5.1**

**Property 31: Follow-up Due Notification**
*For any* follow-up with follow_up_date equal to today and status 'pending', a notification SHALL exist for the assigned doctor.
**Validates: Requirements 5.2**

**Property 32: Referral Notification Creation**
*For any* new referral creation, a notification SHALL be created for the target doctor with type 'referral'.
**Validates: Requirements 5.3**

**Property 33: Unread Count Accuracy**
*For any* user, the unread notification count SHALL equal the number of notifications with is_read = false for that user.
**Validates: Requirements 5.4**

**Property 34: Notification Grouping**
*For any* notification list request with grouping, notifications SHALL be grouped by type field.
**Validates: Requirements 5.5**

**Property 35: Mark as Read Operation**
*For any* notification, marking it as read SHALL set is_read to true and persist the change.
**Validates: Requirements 5.6**

**Property 36: Mark All as Read Operation**
*For any* user, marking all notifications as read SHALL set is_read to true for all notifications belonging to that user.
**Validates: Requirements 5.7**

**Property 37: Notification Preferences Persistence**
*For any* user notification preferences update, the preferences SHALL be stored and applied to future notifications.
**Validates: Requirements 5.8**

**Property 38: Cancellation Notification**
*For any* appointment cancellation, a notification SHALL be created for the assigned doctor with type 'appointment'.
**Validates: Requirements 5.9**

### Referral System Properties

**Property 39: Referral Data Completeness**
*For any* referral creation, it SHALL contain specialty, target doctor, patient summary, and referral reason.
**Validates: Requirements 6.1, 6.2**

**Property 40: Referral Status Validation**
*For any* referral, it SHALL have a valid status ('pending', 'accepted', 'rejected', 'completed') at all times.
**Validates: Requirements 6.4**

**Property 41: Referral Direction Filtering**
*For any* doctor, incoming referrals SHALL have to_doctor_id equal to the doctor's ID, and outgoing referrals SHALL have from_doctor_id equal to the doctor's ID.
**Validates: Requirements 6.5**

**Property 42: Referral Status Update**
*For any* referral, accepting or rejecting it SHALL update the status field and set responded_at timestamp.
**Validates: Requirements 6.6**

**Property 43: Referral to Appointment Workflow**
*For any* accepted referral, creating an appointment SHALL link the appointment to the referral's patient and target doctor.
**Validates: Requirements 6.7**

**Property 44: Referral Outcome Tracking**
*For any* referral, outcome data (status, response_notes, responded_at) SHALL be recorded and retrievable.
**Validates: Requirements 6.8**

### Appointment System Properties

**Property 45: Appointment Rescheduling**
*For any* appointment update with new date/time, the changes SHALL be persisted and reflected in subsequent queries.
**Validates: Requirements 7.2**

**Property 46: Double-booking Prevention**
*For any* appointment creation request, if another appointment exists for the same doctor with overlapping time, the request SHALL be rejected.
**Validates: Requirements 7.3**

**Property 47: Doctor Availability Check**
*For any* appointment creation, if the appointment time is outside the doctor's working hours, the request SHALL be rejected.
**Validates: Requirements 7.4**

**Property 48: Recurring Appointment Creation**
*For any* recurring appointment request, the system SHALL create multiple appointment records with correct dates based on recurrence pattern.
**Validates: Requirements 7.5**

**Property 49: Appointment Duration Storage**
*For any* appointment, the duration field SHALL be stored and retrievable.
**Validates: Requirements 7.6**

**Property 50: Appointment Reminder Creation**
*For any* appointment, a reminder notification SHALL be created at the specified time before the appointment.
**Validates: Requirements 7.7**

**Property 51: Attendance Marking**
*For any* appointment, marking attendance SHALL update the status to 'in_progress' or 'completed'.
**Validates: Requirements 7.8**

**Property 52: No-show Rate Calculation**
*For any* period, no-show rate SHALL equal (no_show appointments / total appointments) * 100.
**Validates: Requirements 7.9**

**Property 53: Appointment Cancellation with Reason**
*For any* appointment cancellation, the status SHALL be set to 'cancelled' and cancellation reason SHALL be stored in notes.
**Validates: Requirements 7.10**

### User Management Properties

**Property 54: User Creation Validation**
*For any* user creation request, it SHALL contain email, password, role, and clinic_id (except for system_admin).
**Validates: Requirements 8.1, 8.3**

**Property 55: Role-based Permission Enforcement**
*For any* protected operation, access SHALL be granted only if the user's role has the required permission.
**Validates: Requirements 8.2**

**Property 56: User Status Update**
*For any* user, activating or deactivating SHALL update the status field to 'active' or 'inactive' respectively.
**Validates: Requirements 8.4**

**Property 57: Password Reset Operation**
*For any* password reset, the new password SHALL be hashed and stored, replacing the old password.
**Validates: Requirements 8.5**

**Property 58: User Activity Logging**
*For any* user action (create, update, delete), an audit log entry SHALL be created with user_id, action, and timestamp.
**Validates: Requirements 8.6**

**Property 59: Clinic Assignment**
*For any* user (except system_admin), the clinic_id field SHALL be set and reference a valid clinic.
**Validates: Requirements 8.7**

**Property 60: User Status Filtering**
*For any* user list request with status filter, results SHALL contain only users with matching status.
**Validates: Requirements 8.8**

### Settings System Properties

**Property 61: Profile Update Persistence**
*For any* user profile update, the changes SHALL be persisted and retrievable in subsequent queries.
**Validates: Requirements 9.1**

**Property 62: Profile Picture Upload**
*For any* profile picture upload, the file SHALL be stored and the profile_picture_url SHALL be updated.
**Validates: Requirements 9.3**

**Property 63: Clinic Information Update**
*For any* clinic information update by clinic owner, the changes SHALL be persisted and retrievable.
**Validates: Requirements 9.4**

**Property 64: Appointment Duration Default**
*For any* clinic settings update with appointment duration, the default duration SHALL be stored and applied to new appointments.
**Validates: Requirements 9.6**

**Property 65: Working Hours Configuration**
*For any* working hours update, the configuration SHALL be stored in JSONB format and retrievable.
**Validates: Requirements 9.7**


### Search System Properties

**Property 66: Multi-entity Search**
*For any* global search query, results SHALL include matches from patients, appointments, and consultations.
**Validates: Requirements 10.2**

**Property 67: Multi-field Patient Search**
*For any* patient search query, results SHALL include patients matching the query in name, phone, or file_number fields.
**Validates: Requirements 10.3**

**Property 68: Date Range Filtering**
*For any* search with date range filter, results SHALL include only records with dates within the specified range (inclusive).
**Validates: Requirements 10.4**

**Property 69: Search Result Grouping**
*For any* search results, they SHALL be grouped by entity type (patients, appointments, consultations).
**Validates: Requirements 10.5**

**Property 70: Search Filter Application**
*For any* search with filters (date, status, type), results SHALL match all specified filter criteria.
**Validates: Requirements 10.7**

**Property 71: Recent Search Recording**
*For any* search query execution, the query SHALL be recorded in the user's search history.
**Validates: Requirements 10.8**

### File Management Properties

**Property 72: File Upload with Metadata**
*For any* file upload, the file SHALL be stored with complete metadata (file_name, file_type, file_size, uploaded_by, uploaded_at).
**Validates: Requirements 11.1**

**Property 73: File Type Validation**
*For any* file upload, the system SHALL accept only valid file types (PDF, images, documents) and reject invalid types.
**Validates: Requirements 11.2**

**Property 74: File Retrieval**
*For any* file ID, the file SHALL be retrievable with correct content and metadata.
**Validates: Requirements 11.4**

**Property 75: File Deletion**
*For any* file deletion, the file SHALL be removed from storage and no longer retrievable.
**Validates: Requirements 11.5**

**Property 76: File Categorization**
*For any* file, it SHALL be categorized by file_type ('lab_result', 'xray', 'report', 'other').
**Validates: Requirements 11.6**

**Property 77: File Metadata Completeness**
*For any* file, metadata SHALL include upload_date and uploader information.
**Validates: Requirements 11.7**

**Property 78: File Size Validation**
*For any* file upload exceeding 10MB, the upload SHALL be rejected with appropriate error message.
**Validates: Requirements 11.8**

**Property 79: Storage Calculation**
*For any* patient, total storage used SHALL equal the sum of file_size for all files belonging to that patient.
**Validates: Requirements 11.9**

### Medical History Properties

**Property 80: Medical History Data Storage**
*For any* medical history update (chronic diseases, allergies, surgeries, family history, medications), the data SHALL be stored and retrievable.
**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

**Property 81: Medical History Update Persistence**
*For any* medical history update operation, the changes SHALL be persisted and reflected in subsequent queries.
**Validates: Requirements 12.7**

**Property 82: Medical History Timeline Ordering**
*For any* medical history timeline, events SHALL be ordered chronologically by date.
**Validates: Requirements 12.8**

**Property 83: Consultation Medical History Context**
*For any* consultation start, the patient's medical history SHALL be included in the consultation context.
**Validates: Requirements 12.9**

### Printing System Properties

**Property 84: Document Content Completeness**
*For any* printed document (prescription, report, invoice, medical history), it SHALL contain clinic header, clinic logo, and required document-specific fields.
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.6**

**Property 85: Print Template Application**
*For any* document printing with custom template, the template SHALL be applied correctly to the document data.
**Validates: Requirements 13.5**

**Property 86: Prescription Signature Inclusion**
*For any* printed prescription, it SHALL include the doctor's signature.
**Validates: Requirements 13.7**

### Nurse Dashboard Properties

**Property 87: Today's Appointments Filtering**
*For any* nurse dashboard, displayed appointments SHALL have appointment_date equal to today.
**Validates: Requirements 14.1**

**Property 88: Patient Registration**
*For any* patient registration by nurse, the patient SHALL be created with all required fields.
**Validates: Requirements 14.3**

**Property 89: Appointment Scheduling**
*For any* appointment creation by nurse, the appointment SHALL be created with correct patient, doctor, date, and time.
**Validates: Requirements 14.4**

**Property 90: Waiting Patients Display**
*For any* nurse dashboard, waiting patients SHALL be those with appointment status 'confirmed' or 'in_progress' for today.
**Validates: Requirements 14.5**

**Property 91: Vital Signs Recording**
*For any* vital signs entry, the data SHALL be stored with patient_id, recorded_by, and timestamp.
**Validates: Requirements 14.6**

**Property 92: Nurse Dashboard Statistics**
*For any* nurse dashboard, statistics (patients today, waiting, completed) SHALL be calculated from today's appointment data.
**Validates: Requirements 14.7**

**Property 93: Sensitive Data Access Control**
*For any* nurse role user, access to sensitive medical information (diagnosis, treatment, prescriptions) SHALL be restricted.
**Validates: Requirements 14.8**

### Admin Dashboard Properties

**Property 94: Platform Statistics Calculation**
*For any* admin dashboard, platform-wide statistics SHALL be calculated from all clinics and users.
**Validates: Requirements 15.1**

**Property 95: All Clinics Retrieval**
*For any* admin clinics list request, all clinics SHALL be returned with their current status.
**Validates: Requirements 15.2**

**Property 96: Clinic Status Update**
*For any* clinic activation/deactivation by admin, the clinic status SHALL be updated to 'active' or 'suspended'.
**Validates: Requirements 15.3**

**Property 97: All Users Retrieval**
*For any* admin users list request, all users across all clinics SHALL be returned.
**Validates: Requirements 15.4**

**Property 98: System Health Metrics**
*For any* admin dashboard, system health metrics SHALL include database connection status, response times, and error rates.
**Validates: Requirements 15.6**

**Property 99: Activity Logs Ordering**
*For any* activity logs display, logs SHALL be ordered by timestamp in descending order (most recent first).
**Validates: Requirements 15.7**

**Property 100: Clinic Details Completeness**
*For any* clinic details view, it SHALL include clinic information and statistics (total patients, appointments, revenue).
**Validates: Requirements 15.8**

### Communication System Properties

**Property 101: Communication Log Recording**
*For any* communication (phone call, SMS, WhatsApp), a log entry SHALL be created with patient_id, user_id, type, direction, status, and timestamp.
**Validates: Requirements 16.1, 16.2, 16.3**

**Property 102: Communication Log Retrieval**
*For any* patient profile, communication logs SHALL be included and ordered by timestamp.
**Validates: Requirements 16.4**

**Property 103: Communication Log Completeness**
*For any* communication log entry, it SHALL contain type, date, and notes fields.
**Validates: Requirements 16.5**

**Property 104: Communication Type Filtering**
*For any* communication log request with type filter, results SHALL contain only logs matching the specified type.
**Validates: Requirements 16.6**

**Property 105: Communication Success Rate**
*For any* period, communication success rate SHALL equal (successful communications / total communications) * 100.
**Validates: Requirements 16.8**

### Export/Import System Properties

**Property 106: Data Export Completeness**
*For any* data export (patients, appointments, financial), the exported file SHALL contain all records with all fields.
**Validates: Requirements 17.1, 17.2, 17.3**

**Property 107: Import/Export Round Trip**
*For any* exported data, importing it back SHALL result in equivalent records (round-trip property).
**Validates: Requirements 17.4**

**Property 108: Import Data Validation**
*For any* data import, invalid records SHALL be rejected and valid records SHALL be imported.
**Validates: Requirements 17.5**

**Property 109: Import Error Collection**
*For any* data import with errors, all errors and warnings SHALL be collected and returned to the user.
**Validates: Requirements 17.6**

**Property 110: Bulk Operation Atomicity**
*For any* bulk operation, either all operations succeed or all fail (atomic transaction).
**Validates: Requirements 17.7**

**Property 111: Import/Export Audit Logging**
*For any* import or export operation, an audit log entry SHALL be created with user_id, operation type, record count, and timestamp.
**Validates: Requirements 17.8**

### Security System Properties

**Property 112: Password Policy Enforcement**
*For any* password creation or update, passwords not meeting strength requirements (min 8 chars, uppercase, lowercase, number) SHALL be rejected.
**Validates: Requirements 18.1**

**Property 113: Two-Factor Authentication**
*For any* user with 2FA enabled, login SHALL require both password and 2FA code verification.
**Validates: Requirements 18.2**

**Property 114: User Action Logging**
*For any* user action (create, read, update, delete), an audit log entry SHALL be created.
**Validates: Requirements 18.3**

**Property 115: Session Timeout**
*For any* user session, if inactive for the configured timeout period, the session SHALL be invalidated.
**Validates: Requirements 18.4**

**Property 116: Data Encryption at Rest**
*For any* sensitive data field (password, medical records), the data SHALL be encrypted before storage.
**Validates: Requirements 18.5**

**Property 117: IP Whitelist Enforcement**
*For any* request from non-whitelisted IP when IP whitelisting is enabled, the request SHALL be rejected.
**Validates: Requirements 18.6**

**Property 118: Security Audit Log Retrieval**
*For any* security audit log request, logs SHALL include user_id, action, IP address, timestamp, and result.
**Validates: Requirements 18.7**

**Property 119: Suspicious Activity Detection**
*For any* suspicious activity pattern (multiple failed logins, unusual access patterns), an alert SHALL be created.
**Validates: Requirements 18.9**

### Backup System Properties

**Property 120: Daily Backup Creation**
*For any* day, an automated backup SHALL be created at the scheduled time.
**Validates: Requirements 19.1**

**Property 121: Manual Backup Creation**
*For any* manual backup request, a backup SHALL be created immediately with correct timestamp.
**Validates: Requirements 19.2**

**Property 122: Backup History Retrieval**
*For any* backup history request, all backup records SHALL be returned ordered by creation date.
**Validates: Requirements 19.3**

**Property 123: Backup Download**
*For any* backup ID, the backup file SHALL be downloadable with correct content.
**Validates: Requirements 19.4**

**Property 124: Point-in-time Recovery**
*For any* restore operation with specific timestamp, data SHALL be restored to the state at that timestamp.
**Validates: Requirements 19.5**

**Property 125: Backup Integrity Verification**
*For any* backup creation, the backup SHALL be verified for integrity before marking as successful.
**Validates: Requirements 19.6**

**Property 126: Backup Failure Alerting**
*For any* failed backup operation, an alert SHALL be created for system administrators.
**Validates: Requirements 19.7**

**Property 127: Backup Retention Policy**
*For any* backup older than 30 days, it SHALL be automatically deleted.
**Validates: Requirements 19.8**

### Multi-language Support Properties

**Property 128: Translation Availability**
*For any* UI element key, translations SHALL exist for both Arabic and English languages.
**Validates: Requirements 20.1, 20.4**

**Property 129: Language Preference Persistence**
*For any* language preference update, the preference SHALL be stored and applied to all subsequent requests.
**Validates: Requirements 20.2, 20.3**

**Property 130: Notification Translation**
*For any* notification, the title and message SHALL be in the user's preferred language.
**Validates: Requirements 20.6**

**Property 131: Document Translation**
*For any* printed document, the content SHALL be in the user's preferred language.
**Validates: Requirements 20.7**

**Property 132: Locale-specific Formatting**
*For any* date or number display, the format SHALL match the user's locale (Arabic or English).
**Validates: Requirements 20.8**


## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)
- Invalid input data (missing required fields, wrong data types)
- Business rule violations (double-booking, invalid dates)
- File size/type violations
- Password policy violations

**Handling Strategy:**
- Validate input using Zod schemas
- Return descriptive error messages
- Include field-level errors for forms
- Log validation failures for monitoring

#### 2. Authentication Errors (401 Unauthorized)
- Invalid credentials
- Expired sessions
- Missing authentication tokens
- 2FA verification failures

**Handling Strategy:**
- Clear error messages without revealing security details
- Automatic session cleanup
- Rate limiting on failed attempts
- Security audit logging

#### 3. Authorization Errors (403 Forbidden)
- Insufficient permissions
- Role-based access violations
- Clinic access restrictions
- IP whitelist violations

**Handling Strategy:**
- Check permissions before operations
- Log unauthorized access attempts
- Return generic "Access Denied" messages
- Alert on suspicious patterns

#### 4. Not Found Errors (404 Not Found)
- Resource doesn't exist
- Deleted resources
- Invalid IDs

**Handling Strategy:**
- Verify resource existence before operations
- Return clear "not found" messages
- Log frequent 404s for debugging

#### 5. Conflict Errors (409 Conflict)
- Appointment time conflicts
- Duplicate records
- Concurrent modification conflicts

**Handling Strategy:**
- Check for conflicts before operations
- Use database constraints
- Provide resolution suggestions
- Implement optimistic locking where needed

#### 6. Server Errors (500 Internal Server Error)
- Database connection failures
- Unexpected exceptions
- Third-party service failures
- File system errors

**Handling Strategy:**
- Catch all unhandled exceptions
- Log full error details
- Return generic error messages to users
- Alert administrators
- Implement retry logic for transient failures

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Logging

All errors will be logged with:
- Timestamp
- User ID (if authenticated)
- Request ID
- Error type and message
- Stack trace (for server errors)
- Request details (method, path, body)

### Error Recovery

#### Database Errors
- Connection pool management
- Automatic reconnection
- Transaction rollback
- Fallback to read replicas

#### File Upload Errors
- Cleanup partial uploads
- Retry failed uploads
- Validate before processing
- Quarantine suspicious files

#### External Service Errors
- Circuit breaker pattern
- Graceful degradation
- Cached fallback data
- User notifications

## Testing Strategy

### Dual Testing Approach

The system will use both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Unit Testing

**Focus Areas:**
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases and error conditions
- API endpoint responses
- Database operations
- Authentication flows

**Testing Framework:**
- Vitest for test execution
- Supertest for API testing
- Fast-check for property-based testing

**Unit Test Examples:**
```typescript
// Example: Specific appointment creation
test('should create appointment with valid data', async () => {
  const appointment = await createAppointment({
    clinic_id: 'clinic-1',
    patient_id: 'patient-1',
    doctor_id: 'doctor-1',
    appointment_date: '2024-01-15',
    appointment_time: '10:00',
    duration: 30
  });
  
  expect(appointment).toBeDefined();
  expect(appointment.status).toBe('scheduled');
});

// Example: Edge case - appointment on weekend
test('should reject appointment on weekend', async () => {
  await expect(createAppointment({
    appointment_date: '2024-01-14', // Saturday
    // ... other fields
  })).rejects.toThrow('Appointments not allowed on weekends');
});
```

### Property-Based Testing

**Configuration:**
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: marktology-complete-features, Property {number}: {property_text}`

**Property Test Examples:**
```typescript
// Property 1: Follow-up Creation
test('Property 1: Follow-up creation from consultation', () => {
  fc.assert(
    fc.property(
      fc.record({
        patient_id: fc.uuid(),
        doctor_id: fc.uuid(),
        consultation_id: fc.uuid(),
        follow_up_date: fc.date({ min: new Date() }),
        follow_up_type: fc.constantFrom('phone_call', 'visit', 'test_results'),
        reason: fc.string({ minLength: 1, maxLength: 500 })
      }),
      async (followUpData) => {
        const followUp = await createFollowUp(followUpData);
        
        expect(followUp.patient_id).toBe(followUpData.patient_id);
        expect(followUp.doctor_id).toBe(followUpData.doctor_id);
        expect(followUp.follow_up_type).toBe(followUpData.follow_up_type);
        expect(followUp.status).toBe('pending');
      }
    ),
    { numRuns: 100 }
  );
});

// Property 21: Partial Payment Tracking
test('Property 21: Partial payment amount consistency', () => {
  fc.assert(
    fc.property(
      fc.record({
        total: fc.float({ min: 100, max: 10000 }),
        amount_paid: fc.float({ min: 1, max: 9999 })
      }),
      async ({ total, amount_paid }) => {
        fc.pre(amount_paid < total); // Ensure partial payment
        
        const invoice = await createInvoice({
          total,
          amount_paid,
          // ... other fields
        });
        
        const amount_due = total - amount_paid;
        expect(invoice.amount_paid + invoice.amount_due).toBeCloseTo(invoice.total, 2);
        expect(invoice.payment_status).toBe('partial');
      }
    ),
    { numRuns: 100 }
  );
});

// Property 46: Double-booking Prevention
test('Property 46: Prevent overlapping appointments', () => {
  fc.assert(
    fc.property(
      fc.record({
        doctor_id: fc.uuid(),
        date: fc.date(),
        time1: fc.constantFrom('09:00', '10:00', '11:00', '14:00'),
        time2: fc.constantFrom('09:00', '10:00', '11:00', '14:00'),
        duration: fc.constantFrom(30, 60)
      }),
      async ({ doctor_id, date, time1, time2, duration }) => {
        // Create first appointment
        const apt1 = await createAppointment({
          doctor_id,
          appointment_date: date,
          appointment_time: time1,
          duration
        });
        
        // Try to create overlapping appointment
        if (time1 === time2) {
          await expect(createAppointment({
            doctor_id,
            appointment_date: date,
            appointment_time: time2,
            duration
          })).rejects.toThrow('Appointment time conflict');
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Property 107: Import/Export Round Trip
test('Property 107: Patient data export/import round trip', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        full_name: fc.string({ minLength: 1 }),
        date_of_birth: fc.date({ max: new Date() }),
        gender: fc.constantFrom('male', 'female'),
        phone: fc.string({ minLength: 10, maxLength: 15 }),
        address: fc.string({ minLength: 1 })
      }), { minLength: 1, maxLength: 100 }),
      async (patients) => {
        // Create patients
        const created = await Promise.all(
          patients.map(p => createPatient(p))
        );
        
        // Export
        const exported = await exportPatients(created.map(p => p.id));
        
        // Delete originals
        await Promise.all(created.map(p => deletePatient(p.id)));
        
        // Import
        const imported = await importPatients(exported);
        
        // Verify equivalence
        expect(imported.length).toBe(created.length);
        imported.forEach((imp, i) => {
          expect(imp.full_name).toBe(created[i].full_name);
          expect(imp.phone).toBe(created[i].phone);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Organization

```
server/__tests__/
├── unit/
│   ├── auth.test.ts
│   ├── storage.test.ts
│   ├── routes.test.ts
│   └── utils.test.ts
├── properties/
│   ├── follow-up.properties.test.ts
│   ├── billing.properties.test.ts
│   ├── appointments.properties.test.ts
│   ├── notifications.properties.test.ts
│   └── security.properties.test.ts
├── integration/
│   ├── patient-workflow.test.ts
│   ├── appointment-workflow.test.ts
│   └── billing-workflow.test.ts
└── fixtures/
    ├── patients.ts
    ├── appointments.ts
    └── clinics.ts
```

### Test Coverage Goals

- **Unit Test Coverage**: 80% minimum
- **Property Test Coverage**: All 132 properties implemented
- **Integration Test Coverage**: All major workflows
- **API Endpoint Coverage**: 100%

### Continuous Testing

- Run unit tests on every commit
- Run property tests on pull requests
- Run integration tests before deployment
- Monitor test execution time
- Track flaky tests
- Generate coverage reports

### Testing Best Practices

1. **Write tests first** for critical functionality
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests independent** - no shared state
4. **Use factories** for test data generation
5. **Mock external dependencies** (email, SMS, payment gateways)
6. **Test error cases** as thoroughly as success cases
7. **Use property tests** for business logic validation
8. **Use unit tests** for specific examples and edge cases
9. **Clean up test data** after each test
10. **Run tests in parallel** for faster feedback

## Implementation Notes

### Phase 1: Database Schema (Week 1)
- Create new tables (follow_ups, medical_history, invoices, payments, patient_files, communication_logs, reports)
- Add indexes for performance
- Create migration scripts
- Update Drizzle schema definitions

### Phase 2: Backend Services (Weeks 2-4)
- Implement storage layer methods
- Create API routes
- Add validation schemas
- Implement business logic
- Add error handling
- Write unit tests

### Phase 3: Frontend Components (Weeks 5-7)
- Create page components
- Implement forms and validation
- Add data fetching hooks
- Create UI components
- Implement routing
- Add loading and error states

### Phase 4: Testing (Week 8)
- Write property-based tests
- Write integration tests
- Test all workflows
- Fix bugs
- Performance testing

### Phase 5: Documentation & Deployment (Week 9)
- API documentation
- User guides
- Deployment scripts
- Production configuration
- Monitoring setup

## Performance Considerations

### Database Optimization
- Use connection pooling (max 20 connections)
- Add indexes on frequently queried fields
- Use prepared statements
- Implement query result caching
- Optimize N+1 queries

### API Optimization
- Implement pagination for list endpoints
- Use field selection to reduce payload size
- Add response compression
- Implement rate limiting
- Cache frequently accessed data

### Frontend Optimization
- Code splitting by route
- Lazy load components
- Optimize bundle size
- Use React Query caching
- Implement virtual scrolling for large lists

### File Storage Optimization
- Use cloud storage (S3, Cloudinary)
- Implement CDN for file delivery
- Compress images before upload
- Generate thumbnails asynchronously
- Implement file cleanup for deleted records

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement CORS properly
- Sanitize user inputs
- Use parameterized queries

### Access Control
- Implement role-based permissions
- Validate user access on every request
- Use secure session management
- Implement IP whitelisting
- Add rate limiting

### Audit & Monitoring
- Log all user actions
- Monitor failed login attempts
- Track data access patterns
- Alert on suspicious activities
- Regular security audits

## Deployment Strategy

### Environment Setup
- Development: Local with Neon branch
- Staging: Neon branch with production-like data
- Production: Neon main branch with backups

### Deployment Process
1. Run all tests
2. Build production bundle
3. Run database migrations
4. Deploy backend
5. Deploy frontend
6. Verify health checks
7. Monitor for errors

### Rollback Plan
- Keep previous version deployed
- Database migration rollback scripts
- Quick rollback procedure
- Incident response plan

---

**Design Document Version:** 1.0  
**Last Updated:** December 30, 2024  
**Status:** Ready for Implementation
