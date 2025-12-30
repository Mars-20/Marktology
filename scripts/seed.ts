import { DatabaseStorage } from '../server/storage';

async function seed() {
  console.log('Starting database seed...');

  const storage = new DatabaseStorage();

  try {
    // Create system admin
    console.log('Creating system admin...');
    await storage.createUser({
      username: 'admin',
      email: 'admin@marktology-os.com',
      password: 'admin123',
      role: 'system_admin',
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+1234567890',
      clinic_id: null,
    });
    console.log('✓ System admin created');

    // Create test clinics
    console.log('Creating test clinics...');
    
    const clinic1 = await storage.createClinic({
      name: 'City Medical Center',
      address: '123 Main Street, Cairo, Egypt',
      phone: '+20 123 456 7890',
      email: 'info@citymedical.com',
      owner_id: null,
    });
    console.log(`✓ Clinic created: ${clinic1.clinic_id}`);

    const clinic2 = await storage.createClinic({
      name: 'Alexandria Health Clinic',
      address: '456 Corniche Road, Alexandria, Egypt',
      phone: '+20 111 222 3333',
      email: 'contact@alexhealth.com',
      owner_id: null,
    });
    console.log(`✓ Clinic created: ${clinic2.clinic_id}`);

    // Create doctors and nurses for clinic 1
    console.log('Creating users for City Medical Center...');
    
    const doctor1 = await storage.createUser({
      username: 'dr.sarah',
      email: 'dr.sarah@citymedical.com',
      password: 'password',
      role: 'doctor',
      clinic_id: clinic1.id,
      first_name: 'Sarah',
      last_name: 'Smith',
      phone: '+20 100 111 2222',
    });
    console.log('✓ Doctor created: Dr. Sarah Smith');

    const doctor2 = await storage.createUser({
      username: 'dr.ahmed',
      email: 'dr.ahmed@citymedical.com',
      password: 'password',
      role: 'doctor',
      clinic_id: clinic1.id,
      first_name: 'Ahmed',
      last_name: 'Hassan',
      phone: '+20 100 333 4444',
    });
    console.log('✓ Doctor created: Dr. Ahmed Hassan');

    await storage.createUser({
      username: 'nurse.layla',
      email: 'nurse.layla@citymedical.com',
      password: 'password',
      role: 'nurse',
      clinic_id: clinic1.id,
      first_name: 'Layla',
      last_name: 'Mahmoud',
      phone: '+20 100 555 6666',
    });
    console.log('✓ Nurse created: Layla Mahmoud');

    // Create clinic owner for clinic 1
    const owner1 = await storage.createUser({
      username: 'owner.city',
      email: 'owner@citymedical.com',
      password: 'password',
      role: 'clinic_owner',
      clinic_id: clinic1.id,
      first_name: 'Mohamed',
      last_name: 'Ali',
      phone: '+20 100 777 8888',
    });
    await storage.updateClinic(clinic1.id, { owner_id: owner1.id });
    console.log('✓ Clinic owner created');

    // Create users for clinic 2
    console.log('Creating users for Alexandria Health Clinic...');
    
    await storage.createUser({
      username: 'dr.omar',
      email: 'dr.omar@alexhealth.com',
      password: 'password',
      role: 'doctor',
      clinic_id: clinic2.id,
      first_name: 'Omar',
      last_name: 'Khaled',
      phone: '+20 100 999 0000',
    });
    console.log('✓ Doctor created: Dr. Omar Khaled');

    // Create test patients for clinic 1
    console.log('Creating test patients for City Medical Center...');
    
    const patient1 = await storage.createPatient({
      clinic_id: clinic1.id,
      first_name: 'Ahmed',
      last_name: 'Hassan',
      date_of_birth: '1978-05-15',
      gender: 'male',
      phone: '+20 123 456 7890',
      email: 'ahmed.hassan@example.com',
      address: '789 Patient Street, Cairo',
      emergency_contact: 'Fatima Hassan',
      emergency_phone: '+20 111 222 3333',
      blood_type: 'O+',
      allergies: 'Penicillin',
      chronic_conditions: 'Hypertension',
      status: 'active',
    });
    console.log(`✓ Patient created: ${patient1.patient_id}`);

    const patient2 = await storage.createPatient({
      clinic_id: clinic1.id,
      first_name: 'Layla',
      last_name: 'Mahmoud',
      date_of_birth: '1991-08-22',
      gender: 'female',
      phone: '+20 111 222 3333',
      email: 'layla.mahmoud@example.com',
      address: '321 Health Avenue, Cairo',
      emergency_contact: 'Karim Mahmoud',
      emergency_phone: '+20 100 555 6666',
      blood_type: 'A+',
      status: 'active',
    });
    console.log(`✓ Patient created: ${patient2.patient_id}`);

    const patient3 = await storage.createPatient({
      clinic_id: clinic1.id,
      first_name: 'Nour',
      last_name: 'El-Din',
      date_of_birth: '1963-12-10',
      gender: 'female',
      phone: '+20 155 888 9999',
      email: 'nour.eldin@example.com',
      address: '654 Wellness Road, Cairo',
      emergency_contact: 'Yasmin El-Din',
      emergency_phone: '+20 122 333 4444',
      blood_type: 'B+',
      chronic_conditions: 'Diabetes Type 2',
      status: 'active',
    });
    console.log(`✓ Patient created: ${patient3.patient_id}`);

    // Create test appointments
    console.log('Creating test appointments...');
    
    const today = new Date().toISOString().split('T')[0];
    
    await storage.createAppointment({
      clinic_id: clinic1.id,
      patient_id: patient1.id,
      doctor_id: doctor1.id,
      appointment_date: today,
      appointment_time: '10:00',
      duration_minutes: 30,
      type: 'follow_up',
      status: 'scheduled',
      notes: 'Regular checkup for hypertension',
    });
    console.log('✓ Appointment created');

    await storage.createAppointment({
      clinic_id: clinic1.id,
      patient_id: patient2.id,
      doctor_id: doctor1.id,
      appointment_date: today,
      appointment_time: '11:30',
      duration_minutes: 30,
      type: 'consultation',
      status: 'scheduled',
    });
    console.log('✓ Appointment created');

    await storage.createAppointment({
      clinic_id: clinic1.id,
      patient_id: patient3.id,
      doctor_id: doctor2.id,
      appointment_date: today,
      appointment_time: '14:00',
      duration_minutes: 30,
      type: 'check_up',
      status: 'scheduled',
    });
    console.log('✓ Appointment created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('==================');
    console.log('System Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nDoctor (City Medical):');
    console.log('  Username: dr.sarah');
    console.log('  Password: password');
    console.log('\nClinic Owner:');
    console.log('  Username: owner.city');
    console.log('  Password: password');
    console.log('\nClinic IDs:');
    console.log(`  City Medical Center: ${clinic1.clinic_id}`);
    console.log(`  Alexandria Health: ${clinic2.clinic_id}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
