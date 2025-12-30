# Design Document - Marktology OS Platform Fixes & Enhancements

## Overview

This design document outlines the technical approach for transforming the Marktology OS platform from a mock-data prototype into a fully functional MVP with complete backend implementation, database integration, authentication, and all core features working end-to-end.

The platform is a multi-tenant clinic management system built with:
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Wouter (routing)
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with express-session
- **State Management**: TanStack Query (React Query)

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React SPA)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │  React Query │     │
│  │  (Routes)    │  │   (UI/UX)    │  │   (Cache)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────┐
│                  Express.js Server                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │ Middleware   │  │   Storage    │     │
│  │  (API)       │  │ (Auth/Error) │  │  Interface   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ Drizzle ORM
┌────────────────────────┴────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Tables     │  │   Indexes    │  │  Relations   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Model

The system uses a **shared database, shared schema** multi-tenancy model where:
- All clinics share the same database and tables
- Data isolation is achieved through `clinic_id` foreign keys
- Row-level filtering ensures users only see their clinic's data
- System admins have cross-clinic access

## Components and Interfaces

### 1. Database Schema

#### Core Tables

**users**
```typescript
{
  id: uuid (PK)
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  role: enum('doctor', 'nurse', 'clinic_owner', 'system_admin')
  clinic_id: uuid (FK -> clinics.id, nullable for system_admin)
  first_name: string
  last_name: string
  phone: string
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

**clinics**
```typescript
{
  id: uuid (PK)
  clinic_id: string (unique, format: CL-XXXX)
  name: string
  address: string
  phone: string
  email: string
  owner_id: uuid (FK -> users.id)
  is_active: boolean
  subscription_status: enum('trial', 'active', 'suspended')
  created_at: timestamp
  updated_at: timestamp
}
```

**patients**
```typescript
{
  id: uuid (PK)
  clinic_id: uuid (FK -> clinics.id)
  patient_id: string (unique per clinic, format: P-XXXX)
  first_name: string
  last_name: string
  date_of_birth: date
  gender: enum('male', 'female', 'other')
  phone: string
  email: string (nullable)
  address: string
  emergency_contact: string
  emergency_phone: string
  blood_type: string (nullable)
  allergies: text (nullable)
  chronic_conditions: text (nullable)
  status: enum('active', 'inactive')
  created_at: timestamp
  updated_at: timestamp
}
```

**appointments**
```typescript
{
  id: uuid (PK)
  clinic_id: uuid (FK -> clinics.id)
  patient_id: uuid (FK -> patients.id)
  doctor_id: uuid (FK -> users.id)
  appointment_date: date
  appointment_time: time
  duration_minutes: integer (default: 30)
  type: enum('consultation', 'follow_up', 'check_up')
  status: enum('scheduled', 'in_progress', 'completed', 'cancelled')
  notes: text (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

**consultations**
```typescript
{
  id: uuid (PK)
  appointment_id: uuid (FK -> appointments.id)
  clinic_id: uuid (FK -> clinics.id)
  patient_id: uuid (FK -> patients.id)
  doctor_id: uuid (FK -> users.id)
  chief_complaint: text
  symptoms: text
  diagnosis: text
  treatment_plan: text
  prescriptions: jsonb (array of {medication, dosage, frequency, duration})
  vital_signs: jsonb ({temperature, blood_pressure, heart_rate, weight, height})
  notes: text
  follow_up_date: date (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

**referrals**
```typescript
{
  id: uuid (PK)
  clinic_id: uuid (FK -> clinics.id)
  patient_id: uuid (FK -> patients.id)
  referring_doctor_id: uuid (FK -> users.id)
  referred_to: string (specialist name/clinic)
  reason: text
  status: enum('pending', 'accepted', 'completed', 'cancelled')
  notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

**notifications**
```typescript
{
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  clinic_id: uuid (FK -> clinics.id)
  type: enum('appointment', 'referral', 'system', 'reminder')
  title: string
  message: text
  is_read: boolean (default: false)
  related_entity_type: string (nullable)
  related_entity_id: uuid (nullable)
  created_at: timestamp
}
```

#### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

### 2. Backend API Endpoints

#### Authentication Endpoints

```typescript
POST   /api/auth/login
  Body: { username: string, password: string }
  Response: { user: User, session: Session }

POST   /api/auth/logout
  Response: { success: boolean }

GET    /api/auth/me
  Response: { user: User }
```

#### User Management

```typescript
GET    /api/users
  Query: { clinic_id?: string, role?: string }
  Response: { users: User[] }

GET    /api/users/:id
  Response: { user: User }

POST   /api/users
  Body: { username, email, password, role, clinic_id, first_name, last_name, phone }
  Response: { user: User }

PATCH  /api/users/:id
  Body: Partial<User>
  Response: { user: User }

DELETE /api/users/:id
  Response: { success: boolean }
```

#### Clinic Management

```typescript
GET    /api/clinics
  Response: { clinics: Clinic[] }

GET    /api/clinics/:id
  Response: { clinic: Clinic }

POST   /api/clinics
  Body: { name, address, phone, email, owner_info }
  Response: { clinic: Clinic, owner: User, clinic_id: string }

PATCH  /api/clinics/:id
  Body: Partial<Clinic>
  Response: { clinic: Clinic }

GET    /api/clinics/:id/stats
  Response: { total_patients, total_appointments, active_users, monthly_revenue }
```

#### Patient Management

```typescript
GET    /api/patients
  Query: { clinic_id: string, search?: string, status?: string }
  Response: { patients: Patient[] }

GET    /api/patients/:id
  Response: { patient: Patient, recent_appointments: Appointment[], recent_consultations: Consultation[] }

POST   /api/patients
  Body: Patient data
  Response: { patient: Patient }

PATCH  /api/patients/:id
  Body: Partial<Patient>
  Response: { patient: Patient }

DELETE /api/patients/:id
  Response: { success: boolean }
```

#### Appointment Management

```typescript
GET    /api/appointments
  Query: { clinic_id: string, date?: string, doctor_id?: string, patient_id?: string }
  Response: { appointments: Appointment[] }

GET    /api/appointments/:id
  Response: { appointment: Appointment }

POST   /api/appointments
  Body: Appointment data
  Response: { appointment: Appointment }

PATCH  /api/appointments/:id
  Body: Partial<Appointment>
  Response: { appointment: Appointment }

DELETE /api/appointments/:id
  Response: { success: boolean }

POST   /api/appointments/:id/start
  Response: { appointment: Appointment, consultation: Consultation }

POST   /api/appointments/:id/complete
  Response: { appointment: Appointment }
```

#### Consultation Management

```typescript
GET    /api/consultations
  Query: { clinic_id: string, patient_id?: string, doctor_id?: string }
  Response: { consultations: Consultation[] }

GET    /api/consultations/:id
  Response: { consultation: Consultation }

POST   /api/consultations
  Body: Consultation data
  Response: { consultation: Consultation }

PATCH  /api/consultations/:id
  Body: Partial<Consultation>
  Response: { consultation: Consultation }
```

#### Referral Management

```typescript
GET    /api/referrals
  Query: { clinic_id: string, patient_id?: string, status?: string }
  Response: { referrals: Referral[] }

POST   /api/referrals
  Body: Referral data
  Response: { referral: Referral }

PATCH  /api/referrals/:id
  Body: Partial<Referral>
  Response: { referral: Referral }
```

#### Notification Management

```typescript
GET    /api/notifications
  Query: { user_id: string, is_read?: boolean }
  Response: { notifications: Notification[] }

PATCH  /api/notifications/:id/read
  Response: { notification: Notification }

PATCH  /api/notifications/read-all
  Response: { count: number }
```

### 3. Authentication & Authorization

#### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### Session Management

```typescript
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));
```

#### Passport Configuration

```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
```

#### Authorization Middleware

```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

function requireClinicAccess(req: Request, res: Response, next: NextFunction) {
  const clinicId = req.params.clinic_id || req.query.clinic_id || req.body.clinic_id;
  
  if (req.user.role === 'system_admin') {
    return next(); // System admins have access to all clinics
  }
  
  if (req.user.clinic_id !== clinicId) {
    return res.status(403).json({ message: 'Access denied to this clinic' });
  }
  
  next();
}
```

### 4. Storage Interface Implementation

#### Database Storage Class

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    this.db = drizzle(this.pool, { schema });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const [user] = await this.db
      .insert(schema.users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  // Similar methods for other entities...
}
```

### 5. Frontend Integration

#### API Client Setup

```typescript
// lib/api.ts
const API_BASE = '/api';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Important for session cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: LoginCredentials) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI('/auth/me'),
  },
  patients: {
    list: (clinicId: string) => fetchAPI(`/patients?clinic_id=${clinicId}`),
    get: (id: string) => fetchAPI(`/patients/${id}`),
    create: (data: CreatePatient) =>
      fetchAPI('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Patient>) =>
      fetchAPI(`/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  // Similar for other resources...
};
```

#### React Query Integration

```typescript
// hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePatients(clinicId: string) {
  return useQuery({
    queryKey: ['patients', clinicId],
    queryFn: () => api.patients.list(clinicId),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => api.patients.get(id),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.patients.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
```

#### Component Updates

```typescript
// Example: PatientList.tsx
export default function PatientList() {
  const { user } = useAuth();
  const { data: patients, isLoading, error } = usePatients(user.clinic_id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <DashboardLayout>
      {/* Render patients */}
    </DashboardLayout>
  );
}
```

## Data Models

### TypeScript Types

```typescript
// shared/types.ts
export type UserRole = 'doctor' | 'nurse' | 'clinic_owner' | 'system_admin';
export type AppointmentType = 'consultation' | 'follow_up' | 'check_up';
export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type PatientStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  clinic_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Clinic {
  id: string;
  clinic_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  owner_id: string;
  is_active: boolean;
  subscription_status: 'trial' | 'active' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  clinic_id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  phone: string;
  email: string | null;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  blood_type: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  status: PatientStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: Date;
  appointment_time: string;
  duration_minutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  chief_complaint: string;
  symptoms: string;
  diagnosis: string;
  treatment_plan: string;
  prescriptions: Prescription[];
  vital_signs: VitalSigns;
  notes: string;
  follow_up_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface VitalSigns {
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  weight?: number;
  height?: number;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Request Validation

*For any* API endpoint and any invalid request data, the system should reject the request and return a 400 status code with a descriptive error message.

**Validates: Requirements 2.2, 2.3**

### Property 2: Password Security

*For any* user account created in the system, the stored password should be hashed (not plaintext) and should verify correctly against the original password using bcrypt.

**Validates: Requirements 4.1**

### Property 3: Role-Based Access Control

*For any* protected API endpoint and any user without the required role, the system should return a 403 Forbidden response.

**Validates: Requirements 4.5**

### Property 4: Unauthenticated Access Prevention

*For any* protected route and any unauthenticated request, the system should return a 401 Unauthorized response.

**Validates: Requirements 4.6**

### Property 5: Patient Data Persistence

*For any* valid patient record created through the API, retrieving that patient by ID should return data matching the original input.

**Validates: Requirements 5.1, 5.5**

### Property 6: Clinic Data Isolation

*For any* doctor viewing the patient list, all returned patients should belong only to that doctor's clinic (no cross-clinic data leakage).

**Validates: Requirements 5.2**

### Property 7: Patient Search Functionality

*For any* search query (name, ID, or phone), all returned patients should match the search criteria in at least one of those fields.

**Validates: Requirements 5.3**

### Property 8: Patient Data Validation

*For any* patient data submitted with missing required fields or invalid formats, the system should reject the submission with appropriate validation errors.

**Validates: Requirements 5.6**

### Property 9: Appointment Conflict Prevention

*For any* doctor and time slot, if an appointment already exists, attempting to create another appointment at the same time should fail with a conflict error.

**Validates: Requirements 6.1, 6.3**

### Property 10: Appointment Date Filtering

*For any* date range query, all returned appointments should have appointment dates within that range.

**Validates: Requirements 6.2**

### Property 11: Consultation Data Persistence

*For any* consultation notes or prescription data saved, retrieving the consultation should return the exact data that was saved.

**Validates: Requirements 7.2, 7.3**

### Property 12: Clinic Registration Validation

*For any* clinic registration with missing required fields, the system should reject the registration with validation errors.

**Validates: Requirements 8.1**

### Property 13: Clinic ID Uniqueness

*For any* two clinics registered in the system, their clinic IDs should be unique and follow the format "CL-XXXX".

**Validates: Requirements 8.2, 8.4**

### Property 14: Foreign Key Integrity

*For any* attempt to insert a record with an invalid foreign key reference, the database should reject the operation.

**Validates: Requirements 3.2**

## Error Handling

### Backend Error Handling

#### Global Error Handler

```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error with stack trace
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user?.id,
  });

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Differentiate between dev and production
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message;

  const response: any = { message };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
});
```

#### Validation Error Handler

```typescript
import { fromZodError } from 'zod-validation-error';
import { ZodError } from 'zod';

function handleValidationError(error: ZodError) {
  const validationError = fromZodError(error);
  return {
    status: 400,
    message: 'Validation failed',
    errors: validationError.details,
  };
}
```

#### Database Error Handler

```typescript
function handleDatabaseError(error: any) {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return {
      status: 409,
      message: 'Duplicate entry',
      field: error.constraint,
    };
  }
  
  if (error.code === '23503') {
    return {
      status: 400,
      message: 'Invalid reference',
      field: error.constraint,
    };
  }
  
  return {
    status: 500,
    message: 'Database error',
  };
}
```

### Frontend Error Handling

#### Error Boundary Component

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {this.state.error?.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling

```typescript
// hooks/useApiError.ts
export function useApiError() {
  const { toast } = useToast();

  return (error: unknown) => {
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };
}
```

## Testing Strategy

### Dual Testing Approach

The system will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Testing Framework Setup

#### Backend Testing

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

#### Property-Based Testing Library

We will use **fast-check** for property-based testing in TypeScript:

```bash
npm install --save-dev fast-check
```

### Unit Testing Examples

#### API Endpoint Tests

```typescript
// server/__tests__/patients.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('Patient API', () => {
  it('should create a patient with valid data', async () => {
    const patientData = {
      first_name: 'Ahmed',
      last_name: 'Hassan',
      date_of_birth: '1978-05-15',
      gender: 'male',
      phone: '+20 123 456 7890',
      address: 'Cairo, Egypt',
      emergency_contact: 'Fatima Hassan',
      emergency_phone: '+20 111 222 3333',
    };

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)
      .expect(201);

    expect(response.body.patient).toMatchObject(patientData);
    expect(response.body.patient.id).toBeDefined();
  });

  it('should reject patient creation with missing required fields', async () => {
    const invalidData = {
      first_name: 'Ahmed',
      // Missing other required fields
    };

    const response = await request(app)
      .post('/api/patients')
      .send(invalidData)
      .expect(400);

    expect(response.body.message).toContain('Validation failed');
  });
});
```

### Property-Based Testing Examples

#### Property Test Configuration

All property tests must:
- Run minimum **100 iterations** per test
- Reference the design document property number
- Use the tag format: **Feature: marktology-os-fixes, Property {number}: {property_text}**

#### Example Property Tests

```typescript
// server/__tests__/properties/validation.property.test.ts
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import request from 'supertest';
import { app } from '../../index';

describe('Property Tests: API Validation', () => {
  it('Property 1: API Request Validation - Feature: marktology-os-fixes, Property 1: For any API endpoint and any invalid request data, the system should reject the request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          first_name: fc.option(fc.string(), { nil: undefined }),
          last_name: fc.option(fc.string(), { nil: undefined }),
          // Intentionally missing required fields
        }),
        async (invalidData) => {
          const response = await request(app)
            .post('/api/patients')
            .send(invalidData);

          // Should return 400 for invalid data
          expect(response.status).toBe(400);
          expect(response.body.message).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// server/__tests__/properties/auth.property.test.ts
describe('Property Tests: Authentication', () => {
  it('Property 2: Password Security - Feature: marktology-os-fixes, Property 2: For any user account, password should be hashed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          role: fc.constantFrom('doctor', 'nurse'),
          first_name: fc.string(),
          last_name: fc.string(),
          phone: fc.string(),
        }),
        async (userData) => {
          // Create user
          const user = await storage.createUser(userData);

          // Password should be hashed (not equal to original)
          expect(user.password).not.toBe(userData.password);

          // Should verify correctly
          const isValid = await verifyPassword(userData.password, user.password);
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// server/__tests__/properties/clinic-isolation.property.test.ts
describe('Property Tests: Data Isolation', () => {
  it('Property 6: Clinic Data Isolation - Feature: marktology-os-fixes, Property 6: For any doctor, returned patients should only be from their clinic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          clinic_id: fc.uuid(),
          first_name: fc.string(),
          last_name: fc.string(),
          // ... other patient fields
        }), { minLength: 10, maxLength: 50 }),
        fc.uuid(), // doctor's clinic_id
        async (patients, doctorClinicId) => {
          // Seed database with patients from multiple clinics
          for (const patient of patients) {
            await storage.createPatient(patient);
          }

          // Fetch patients for doctor's clinic
          const result = await storage.getPatients(doctorClinicId);

          // All returned patients should belong to doctor's clinic
          for (const patient of result) {
            expect(patient.clinic_id).toBe(doctorClinicId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

```typescript
// server/__tests__/integration/appointment-flow.test.ts
describe('Integration: Appointment Flow', () => {
  it('should complete full appointment lifecycle', async () => {
    // 1. Create patient
    const patient = await createTestPatient();

    // 2. Schedule appointment
    const appointment = await request(app)
      .post('/api/appointments')
      .send({
        patient_id: patient.id,
        doctor_id: testDoctor.id,
        appointment_date: '2024-01-15',
        appointment_time: '10:00',
        type: 'consultation',
      })
      .expect(201);

    // 3. Start consultation
    const consultation = await request(app)
      .post(`/api/appointments/${appointment.body.id}/start`)
      .expect(200);

    // 4. Add consultation notes
    await request(app)
      .patch(`/api/consultations/${consultation.body.id}`)
      .send({
        chief_complaint: 'Headache',
        diagnosis: 'Migraine',
        treatment_plan: 'Rest and medication',
      })
      .expect(200);

    // 5. Complete appointment
    await request(app)
      .post(`/api/appointments/${appointment.body.id}/complete`)
      .expect(200);

    // 6. Verify final state
    const finalAppointment = await request(app)
      .get(`/api/appointments/${appointment.body.id}`)
      .expect(200);

    expect(finalAppointment.body.status).toBe('completed');
  });
});
```

### Linting Setup

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

#### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

## Implementation Phases

### Phase 1: Foundation (Database & Auth)
1. Update database schema with all tables
2. Implement database storage class
3. Set up authentication with Passport.js
4. Implement session management
5. Create auth middleware

### Phase 2: Core API (Backend)
1. Implement user management endpoints
2. Implement clinic management endpoints
3. Implement patient management endpoints
4. Implement appointment endpoints
5. Implement consultation endpoints
6. Add validation and error handling

### Phase 3: Frontend Integration
1. Create API client layer
2. Set up React Query
3. Update components to use real API
4. Remove mock data dependencies
5. Add loading and error states
6. Implement error boundaries

### Phase 4: Testing & Quality
1. Set up testing framework
2. Write unit tests for API endpoints
3. Write property-based tests
4. Set up linting
5. Configure test coverage reporting
6. Add CI/CD integration

### Phase 5: Polish & Optimization
1. Update branding to Marktology OS
2. Implement code splitting
3. Optimize bundle size
4. Add seed data for development
5. Improve error messages
6. Performance optimization

## Migration Strategy

### From Mock Data to Real API

1. **Identify all mock data usage**
   - Search for `MOCK_` imports
   - List all components using mock data

2. **Create API hooks**
   - Implement React Query hooks for each resource
   - Add loading and error states

3. **Update components incrementally**
   - Replace mock data with API hooks
   - Test each component individually
   - Maintain backward compatibility during transition

4. **Remove mock data files**
   - Delete `mockData.ts` after all migrations complete
   - Update imports and remove unused code

### Database Migration

1. **Create migration script**
   ```bash
   npm run db:push
   ```

2. **Seed development data**
   ```typescript
   // scripts/seed.ts
   async function seed() {
     // Create system admin
     // Create test clinics
     // Create test users
     // Create test patients
     // Create test appointments
   }
   ```

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds = 10
   - Never log passwords
   - Implement password strength requirements

2. **Session Security**
   - Use secure cookies in production
   - Set appropriate session timeout
   - Implement CSRF protection

3. **Data Access Control**
   - Enforce clinic-level data isolation
   - Validate user permissions on every request
   - Log all access attempts

4. **Input Validation**
   - Validate all inputs with Zod schemas
   - Sanitize user inputs
   - Prevent SQL injection through ORM

5. **Error Messages**
   - Don't expose sensitive information in errors
   - Use generic messages in production
   - Log detailed errors server-side only

## Performance Considerations

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Implement query result caching

2. **API Optimization**
   - Implement pagination for list endpoints
   - Use field selection to reduce payload size
   - Add response compression

3. **Frontend Optimization**
   - Implement code splitting
   - Use lazy loading for routes
   - Optimize images and assets
   - Implement React Query caching

4. **Bundle Size**
   - Target < 500KB per chunk
   - Use dynamic imports
   - Tree-shake unused code
   - Minimize dependencies

## Deployment Considerations

1. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   SESSION_SECRET=random-secret-key
   NODE_ENV=production
   PORT=5000
   ```

2. **Database Setup**
   - Run migrations before deployment
   - Set up database backups
   - Configure connection pooling

3. **Build Process**
   ```bash
   npm run build
   npm start
   ```

4. **Health Checks**
   - Implement `/health` endpoint
   - Monitor database connectivity
   - Track error rates

## Conclusion

This design provides a comprehensive blueprint for transforming the Marktology OS platform from a prototype into a production-ready MVP. The implementation follows best practices for security, performance, and maintainability while ensuring all features work end-to-end with real data persistence.
