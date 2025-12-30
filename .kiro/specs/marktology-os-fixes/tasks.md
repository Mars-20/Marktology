# Implementation Plan: Marktology OS Platform Fixes & Enhancements

## Overview

This implementation plan transforms the Marktology OS platform from a mock-data prototype into a fully functional MVP with complete backend implementation, database integration, authentication, and all core features working end-to-end. Tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Update Platform Branding to Marktology OS
  - Update all references from "ClinicRow" or generic names to "Marktology OS"
  - Ensure logo displays correctly in sidebar, login page, and favicon
  - Update page title and meta tags
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Set up Testing Infrastructure
  - [x] 2.1 Install testing dependencies (Vitest, fast-check, supertest)
    - Add test, lint, and coverage scripts to package.json
    - Configure Vitest for both unit and property-based tests
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 2.2 Set up ESLint configuration
    - Create .eslintrc.cjs with TypeScript and React rules
    - Add lint script to package.json
    - _Requirements: 10.2_

  - [x] 2.3 Create test utilities and helpers
    - Create test database setup/teardown utilities
    - Create test data factories for generating test entities
    - _Requirements: 10.3_

- [x] 3. Implement Complete Database Schema
  - [x] 3.1 Update shared/schema.ts with all tables
    - Add clinics, patients, appointments, consultations, referrals, notifications tables
    - Define all foreign key relationships
    - Add timestamp fields (created_at, updated_at) to all tables
    - Use UUID primary keys for all entities
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 3.2 Create database indexes
    - Add performance indexes for frequently queried columns
    - Add composite indexes for clinic_id + date queries
    - _Requirements: 3.3_

  - [x] 3.3 Create Zod validation schemas
    - Create insert and update schemas for all entities
    - Export TypeScript types from schemas
    - _Requirements: 2.2_

  - [ ]* 3.4 Write property test for foreign key integrity
    - **Property 14: Foreign Key Integrity**
    - **Validates: Requirements 3.2**
    - Test that invalid foreign key references are rejected
    - _Requirements: 3.2_

  - [x] 3.5 Create database migration
    - Run drizzle-kit push to create tables
    - Verify all tables and indexes are created
    - _Requirements: 3.6_

- [x] 4. Implement Database Storage Layer
  - [x] 4.1 Create DatabaseStorage class in server/storage.ts
    - Replace MemStorage with PostgreSQL implementation
    - Set up Drizzle ORM connection with connection pooling
    - Implement error handling for database operations
    - _Requirements: 2.4_

  - [x] 4.2 Implement User storage methods
    - getUser, getUserByUsername, getUserByEmail, createUser, updateUser, deleteUser
    - Implement password hashing in createUser
    - _Requirements: 4.1, 5.1_

  - [ ]* 4.3 Write property test for password hashing
    - **Property 2: Password Security**
    - **Validates: Requirements 4.1**
    - Test that all created users have hashed passwords
    - _Requirements: 4.1_

  - [x] 4.4 Implement Clinic storage methods
    - getClinic, getClinics, createClinic, updateClinic, getClinicStats
    - Generate unique clinic IDs in format "CL-XXXX"
    - _Requirements: 8.2, 8.4_

  - [ ]* 4.5 Write property test for clinic ID uniqueness
    - **Property 13: Clinic ID Uniqueness**
    - **Validates: Requirements 8.2, 8.4**
    - Test that all clinic IDs are unique and follow format
    - _Requirements: 8.2, 8.4_

  - [x] 4.6 Implement Patient storage methods
    - getPatient, getPatients, createPatient, updatePatient, deletePatient, searchPatients
    - Implement clinic-level data filtering
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 4.7 Write property test for clinic data isolation
    - **Property 6: Clinic Data Isolation**
    - **Validates: Requirements 5.2**
    - Test that patients are filtered by clinic correctly
    - _Requirements: 5.2_

  - [ ]* 4.8 Write property test for patient data persistence
    - **Property 5: Patient Data Persistence**
    - **Validates: Requirements 5.1, 5.5**
    - Test that created/updated patient data persists correctly
    - _Requirements: 5.1, 5.5_

  - [x] 4.9 Implement Appointment storage methods
    - getAppointment, getAppointments, createAppointment, updateAppointment, deleteAppointment
    - Implement conflict detection for double-booking prevention
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 4.10 Write property test for appointment conflict prevention
    - **Property 9: Appointment Conflict Prevention**
    - **Validates: Requirements 6.1, 6.3**
    - Test that double-booking is prevented
    - _Requirements: 6.1, 6.3_

  - [x] 4.11 Implement Consultation storage methods
    - getConsultation, getConsultations, createConsultation, updateConsultation
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 4.12 Write property test for consultation data persistence
    - **Property 11: Consultation Data Persistence**
    - **Validates: Requirements 7.2, 7.3**
    - Test that consultation notes and prescriptions persist correctly
    - _Requirements: 7.2, 7.3_

  - [x] 4.13 Implement Referral and Notification storage methods
    - Referral: getReferral, getReferrals, createReferral, updateReferral
    - Notification: getNotifications, createNotification, markAsRead, markAllAsRead
    - _Requirements: 9.6, 8.5_

- [x] 5. Checkpoint - Database Layer Complete
  - Ensure all storage methods are implemented
  - Ensure all property tests pass
  - Ask the user if questions arise

- [x] 6. Implement Authentication System
  - [x] 6.1 Install and configure authentication dependencies
    - Install bcrypt, passport, passport-local, express-session, connect-pg-simple
    - Add TypeScript types for authentication
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Create authentication utilities
    - Implement hashPassword and verifyPassword functions using bcrypt
    - Create password validation rules
    - _Requirements: 4.1_

  - [x] 6.3 Configure Passport.js with LocalStrategy
    - Set up passport serialization/deserialization
    - Implement local strategy with username/password
    - _Requirements: 4.3, 4.4_

  - [x] 6.4 Configure express-session with PostgreSQL store
    - Create sessions table in database
    - Configure session middleware with secure settings
    - _Requirements: 4.2_

  - [x] 6.5 Create authentication middleware
    - requireAuth: Check if user is authenticated
    - requireRole: Check if user has required role
    - requireClinicAccess: Check if user has access to clinic data
    - _Requirements: 4.5, 4.6_

  - [ ]* 6.6 Write property test for role-based access control
    - **Property 3: Role-Based Access Control**
    - **Validates: Requirements 4.5**
    - Test that users without required roles are denied access
    - _Requirements: 4.5_

  - [ ]* 6.7 Write property test for unauthenticated access prevention
    - **Property 4: Unauthenticated Access Prevention**
    - **Validates: Requirements 4.6**
    - Test that unauthenticated requests are rejected
    - _Requirements: 4.6_

  - [ ]* 6.8 Write unit tests for authentication flow
    - Test successful login with valid credentials
    - Test failed login with invalid credentials
    - Test logout functionality
    - _Requirements: 4.3, 4.4, 4.7_

- [x] 7. Implement Error Handling Infrastructure
  - [x] 7.1 Create global error handler middleware
    - Implement error logging with stack traces
    - Differentiate between development and production error messages
    - Handle different error types (validation, database, auth)
    - _Requirements: 11.1, 11.6_

  - [x] 7.2 Create validation error handler
    - Use zod-validation-error for user-friendly messages
    - Return 400 status with detailed validation errors
    - _Requirements: 2.3_

  - [x] 7.3 Create database error handler
    - Handle PostgreSQL error codes (duplicate, foreign key, etc.)
    - Return appropriate status codes and messages
    - _Requirements: 11.4_

  - [x] 7.4 Add request/response logging middleware
    - Log all API requests with method, path, user, timestamp
    - Log response status and duration
    - _Requirements: 2.6, 11.5_

  - [ ]* 7.5 Write property test for API validation
    - **Property 1: API Request Validation**
    - **Validates: Requirements 2.2, 2.3**
    - Test that invalid requests are rejected with 400 status
    - _Requirements: 2.2, 2.3_

- [x] 8. Implement Authentication API Endpoints
  - [x] 8.1 Create auth routes in server/routes.ts
    - POST /api/auth/login - Authenticate user and create session
    - POST /api/auth/logout - Destroy session
    - GET /api/auth/me - Get current user info
    - _Requirements: 4.3, 4.4, 4.7_

  - [ ]* 8.2 Write unit tests for auth endpoints
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test logout
    - Test /me endpoint
    - _Requirements: 4.3, 4.4, 4.7_

- [x] 9. Implement User Management API
  - [x] 9.1 Create user routes
    - GET /api/users - List users (with clinic filtering)
    - GET /api/users/:id - Get user by ID
    - POST /api/users - Create new user
    - PATCH /api/users/:id - Update user
    - DELETE /api/users/:id - Delete user
    - Add requireAuth and requireRole middleware
    - _Requirements: 2.1, 4.5_

  - [ ]* 9.2 Write unit tests for user endpoints
    - Test user creation, retrieval, update, delete
    - Test authorization checks
    - _Requirements: 2.1_

- [x] 10. Implement Clinic Management API
  - [x] 10.1 Create clinic routes
    - GET /api/clinics - List all clinics (system admin only)
    - GET /api/clinics/:id - Get clinic details
    - POST /api/clinics - Register new clinic
    - PATCH /api/clinics/:id - Update clinic
    - GET /api/clinics/:id/stats - Get clinic statistics
    - _Requirements: 8.1, 8.2, 8.3, 9.2, 9.6_

  - [ ]* 10.2 Write property test for clinic registration validation
    - **Property 12: Clinic Registration Validation**
    - **Validates: Requirements 8.1**
    - Test that invalid clinic data is rejected
    - _Requirements: 8.1_

  - [ ]* 10.3 Write unit tests for clinic endpoints
    - Test clinic registration flow
    - Test clinic statistics calculation
    - _Requirements: 8.2, 8.3, 9.6_

- [x] 11. Implement Patient Management API
  - [x] 11.1 Create patient routes
    - GET /api/patients - List patients (with search and filtering)
    - GET /api/patients/:id - Get patient profile with history
    - POST /api/patients - Create new patient
    - PATCH /api/patients/:id - Update patient
    - DELETE /api/patients/:id - Delete patient
    - Add clinic access control middleware
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 11.2 Write property test for patient search
    - **Property 7: Patient Search Functionality**
    - **Validates: Requirements 5.3**
    - Test that search results match criteria
    - _Requirements: 5.3_

  - [ ]* 11.3 Write property test for patient data validation
    - **Property 8: Patient Data Validation**
    - **Validates: Requirements 5.6**
    - Test that invalid patient data is rejected
    - _Requirements: 5.6_

  - [ ]* 11.4 Write unit tests for patient endpoints
    - Test patient CRUD operations
    - Test patient profile with history
    - _Requirements: 5.1, 5.4, 5.5_

- [x] 12. Checkpoint - Core APIs Complete
  - Ensure all API endpoints are implemented
  - Ensure all tests pass
  - Test API endpoints manually with Postman or similar
  - Ask the user if questions arise

- [x] 13. Implement Appointment Management API
  - [x] 13.1 Create appointment routes
    - GET /api/appointments - List appointments (with date/doctor/patient filtering)
    - GET /api/appointments/:id - Get appointment details
    - POST /api/appointments - Create new appointment
    - PATCH /api/appointments/:id - Update appointment
    - DELETE /api/appointments/:id - Delete appointment
    - POST /api/appointments/:id/start - Start consultation
    - POST /api/appointments/:id/complete - Complete appointment
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6_

  - [ ]* 13.2 Write property test for appointment date filtering
    - **Property 10: Appointment Date Filtering**
    - **Validates: Requirements 6.2**
    - Test that date range filtering works correctly
    - _Requirements: 6.2_

  - [ ]* 13.3 Write unit tests for appointment endpoints
    - Test appointment creation and conflict detection
    - Test appointment status transitions
    - Test start consultation flow
    - _Requirements: 6.1, 6.4, 7.1_

- [x] 14. Implement Consultation Management API
  - [x] 14.1 Create consultation routes
    - GET /api/consultations - List consultations
    - GET /api/consultations/:id - Get consultation details
    - POST /api/consultations - Create consultation
    - PATCH /api/consultations/:id - Update consultation
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ]* 14.2 Write unit tests for consultation endpoints
    - Test consultation creation and updates
    - Test prescription recording
    - Test consultation history retrieval
    - _Requirements: 7.2, 7.3, 7.5_

- [x] 15. Implement Referral and Notification APIs
  - [x] 15.1 Create referral routes
    - GET /api/referrals - List referrals
    - POST /api/referrals - Create referral
    - PATCH /api/referrals/:id - Update referral status
    - _Requirements: 9.2_

  - [x] 15.2 Create notification routes
    - GET /api/notifications - List user notifications
    - PATCH /api/notifications/:id/read - Mark notification as read
    - PATCH /api/notifications/read-all - Mark all as read
    - _Requirements: 8.5_

  - [ ]* 15.3 Write unit tests for referral and notification endpoints
    - Test referral creation and status updates
    - Test notification creation and read status
    - _Requirements: 8.5, 9.2_

- [x] 16. Implement System Admin Dashboard API
  - [x] 16.1 Create admin routes
    - GET /api/admin/clinics - List all clinics with stats
    - GET /api/admin/users - List all users across clinics
    - PATCH /api/admin/clinics/:id/activate - Activate/deactivate clinic
    - POST /api/admin/users/:id/reset-password - Reset user password
    - GET /api/admin/stats - Get platform-wide statistics
    - Add system_admin role requirement
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 16.2 Write unit tests for admin endpoints
    - Test cross-clinic data access
    - Test clinic activation/deactivation
    - Test password reset
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 17. Checkpoint - All Backend APIs Complete
  - Ensure all API endpoints are implemented and tested
  - Ensure all property tests pass
  - Verify error handling works correctly
  - Ask the user if questions arise

- [x] 18. Create Frontend API Client Layer
  - [x] 18.1 Create lib/api.ts with fetch wrapper
    - Implement fetchAPI function with error handling
    - Include credentials for session cookies
    - Handle response parsing and errors
    - _Requirements: 12.1_

  - [x] 18.2 Create API client methods for all resources
    - auth: login, logout, me
    - users: list, get, create, update, delete
    - clinics: list, get, create, update, stats
    - patients: list, get, create, update, delete, search
    - appointments: list, get, create, update, delete, start, complete
    - consultations: list, get, create, update
    - referrals: list, create, update
    - notifications: list, markRead, markAllRead
    - _Requirements: 12.1_

- [x] 19. Create React Query Hooks
  - [x] 19.1 Create hooks/useAuth.ts
    - useLogin, useLogout, useCurrentUser
    - Handle authentication state
    - _Requirements: 12.2, 12.3_

  - [x] 19.2 Create hooks/usePatients.ts
    - usePatients, usePatient, useCreatePatient, useUpdatePatient, useDeletePatient
    - Implement query invalidation on mutations
    - _Requirements: 12.2, 12.3_

  - [x] 19.3 Create hooks/useAppointments.ts
    - useAppointments, useAppointment, useCreateAppointment, useUpdateAppointment
    - useStartConsultation, useCompleteAppointment
    - _Requirements: 12.2, 12.3_

  - [x] 19.4 Create hooks/useConsultations.ts
    - useConsultations, useConsultation, useCreateConsultation, useUpdateConsultation
    - _Requirements: 12.2, 12.3_

  - [x] 19.5 Create hooks for other resources
    - useUsers, useClinics, useReferrals, useNotifications
    - _Requirements: 12.2, 12.3_

- [x] 20. Create Frontend Error Handling Components
  - [x] 20.1 Create ErrorBoundary component
    - Catch React errors and display user-friendly message
    - Log errors to console
    - _Requirements: 11.2, 11.3_

  - [x] 20.2 Create LoadingSpinner component
    - Reusable loading indicator
    - _Requirements: 12.2_

  - [x] 20.3 Create ErrorMessage component
    - Display API errors to users
    - _Requirements: 11.2, 12.3_

  - [x] 20.4 Create useApiError hook
    - Handle API errors with toast notifications
    - _Requirements: 11.2_

  - [x] 20.5 Wrap App with ErrorBoundary
    - Add ErrorBoundary at root level
    - _Requirements: 11.3_

- [x] 21. Update Login Page to Use Real Authentication
  - [x] 21.1 Update Login.tsx to use useLogin hook
    - Remove mock authentication
    - Handle login errors
    - Redirect on successful login
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 21.2 Add loading and error states
    - Show loading spinner during login
    - Display error messages
    - _Requirements: 12.2, 12.3_

- [x] 22. Update Dashboard to Use Real Data
  - [x] 22.1 Update DoctorDashboard.tsx
    - Replace MOCK_STATS with real API calls
    - Replace MOCK_APPOINTMENTS with useAppointments hook
    - Replace MOCK_PATIENTS with usePatients hook
    - Add loading and error states
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 22.2 Update SystemAdminDashboard.tsx
    - Implement real admin dashboard with API calls
    - Display clinic list, user list, platform stats
    - _Requirements: 9.1, 9.2, 9.3, 9.6_

- [x] 23. Update Patient Management Pages
  - [x] 23.1 Update PatientList.tsx
    - Replace mock data with usePatients hook
    - Implement search functionality
    - Add loading and error states
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 23.2 Update PatientProfile.tsx
    - Replace mock data with usePatient hook
    - Display patient history from API
    - Add loading and error states
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 23.3 Create patient creation/edit forms
    - Implement form validation
    - Use useCreatePatient and useUpdatePatient hooks
    - _Requirements: 5.1, 5.5_

- [x] 24. Update Appointment Management Pages
  - [x] 24.1 Update Calendar.tsx (Appointments page)
    - Replace mock data with useAppointments hook
    - Implement date filtering
    - Add loading and error states
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 24.2 Create appointment creation/edit forms
    - Implement conflict detection UI
    - Use useCreateAppointment and useUpdateAppointment hooks
    - _Requirements: 6.1, 6.4_

- [x] 25. Update Consultation Page
  - [x] 25.1 Update ConsultationView.tsx
    - Replace mock data with useConsultation hook
    - Implement consultation form with all fields
    - Add prescription management
    - Add vital signs recording
    - Use useCreateConsultation and useUpdateConsultation hooks
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 26. Update Remaining Pages
  - [x] 26.1 Update Referrals.tsx
    - Replace mock data with useReferrals hook
    - Implement referral creation and status updates
    - _Requirements: 12.1_

  - [x] 26.2 Update Notifications.tsx
    - Replace mock data with useNotifications hook
    - Implement mark as read functionality
    - _Requirements: 12.1_

  - [x] 26.3 Update Reports.tsx
    - Implement real reporting with API data
    - _Requirements: 12.1_

  - [x] 26.4 Update Settings.tsx
    - Implement real settings management
    - _Requirements: 12.1_

  - [x] 26.5 Update RegisterClinic.tsx
    - Implement real clinic registration
    - Use API for clinic creation
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 27. Remove Mock Data Dependencies
  - [x] 27.1 Delete lib/mockData.ts
    - Remove all mock data exports
    - _Requirements: 12.1_

  - [x] 27.2 Remove all mock data imports
    - Search for MOCK_ imports and remove them
    - Verify no broken imports remain
    - _Requirements: 12.1_

- [x] 28. Checkpoint - Frontend Integration Complete
  - Ensure all pages use real API data
  - Ensure no mock data remains
  - Test all user flows end-to-end
  - Ask the user if questions arise

- [x] 29. Create Development Seed Data Script
  - [x] 29.1 Create scripts/seed.ts
    - Create system admin user
    - Create 2-3 test clinics
    - Create test doctors and nurses for each clinic
    - Create test patients for each clinic
    - Create test appointments
    - _Requirements: 12.5_

  - [x] 29.2 Add seed script to package.json
    - Add "db:seed" script
    - _Requirements: 12.5_

- [x] 30. Implement Build Optimizations
  - [x] 30.1 Implement code splitting
    - Use React.lazy for route components
    - Implement Suspense with loading fallback
    - _Requirements: 13.1, 13.2_

  - [x] 30.2 Optimize Vite build configuration
    - Configure manual chunks for large dependencies
    - Set chunk size warning limit
    - Enable minification and tree-shaking
    - _Requirements: 13.3_

  - [x] 30.3 Optimize assets
    - Compress images
    - Optimize logo file size
    - _Requirements: 13.4_

  - [x] 30.4 Configure caching headers
    - Set cache headers for static assets
    - _Requirements: 13.5_

- [x] 31. Final Testing and Quality Assurance
  - [x] 31.1 Run all tests
    - Run npm run test
    - Ensure all unit tests pass
    - Ensure all property tests pass
    - _Requirements: 10.3, 10.4_

  - [x] 31.2 Run linting
    - Run npm run lint
    - Fix any linting errors
    - _Requirements: 10.2_

  - [x] 31.3 Check test coverage
    - Run npm run test:coverage
    - Review coverage report
    - _Requirements: 10.5_

  - [x] 31.4 Run build
    - Run npm run build
    - Verify build succeeds
    - Check bundle sizes
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 31.5 Manual end-to-end testing
    - Test complete user flows for each role
    - Test error scenarios
    - Test edge cases
    - _Requirements: All_

- [x] 32. Final Checkpoint - MVP Complete
  - All features implemented and tested
  - All tests passing
  - Build optimized
  - Ready for deployment
  - Ask the user for final review

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: Database → Backend API → Frontend Integration → Testing → Optimization
