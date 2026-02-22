const { getDb } = require('./database');
const { v4: uuidv4 } = require('uuid');

const db = getDb();

console.log('Seeding PawChart database...');

// Clear existing data
db.exec(`
  DELETE FROM health_conditions;
  DELETE FROM medications;
  DELETE FROM weight_records;
  DELETE FROM appointments;
  DELETE FROM vaccinations;
  DELETE FROM pets;
`);

// Pets
const pets = [
  {
    id: uuidv4(),
    name: 'Luna',
    species: 'Dog',
    breed: 'Golden Retriever',
    date_of_birth: '2019-04-15',
    gender: 'Female',
    color: 'Golden',
    microchip_id: 'CHIP-123456789',
    photo_url: null,
    notes: 'Loves fetch and swimming. Very friendly.',
  },
  {
    id: uuidv4(),
    name: 'Mochi',
    species: 'Cat',
    breed: 'Scottish Fold',
    date_of_birth: '2021-08-22',
    gender: 'Male',
    color: 'Gray and White',
    microchip_id: 'CHIP-987654321',
    photo_url: null,
    notes: 'Indoor cat. Enjoys window watching.',
  },
  {
    id: uuidv4(),
    name: 'Pebbles',
    species: 'Rabbit',
    breed: 'Holland Lop',
    date_of_birth: '2022-11-03',
    gender: 'Female',
    color: 'White with brown spots',
    microchip_id: null,
    photo_url: null,
    notes: 'Loves leafy greens and hay.',
  },
];

const insertPet = db.prepare(`
  INSERT INTO pets (id, name, species, breed, date_of_birth, gender, color, microchip_id, photo_url, notes)
  VALUES (@id, @name, @species, @breed, @date_of_birth, @gender, @color, @microchip_id, @photo_url, @notes)
`);

for (const pet of pets) {
  insertPet.run(pet);
}

const [luna, mochi, pebbles] = pets;

// Vaccinations
const vaccinations = [
  { id: uuidv4(), pet_id: luna.id, vaccine_name: 'Rabies', date_administered: '2024-01-10', next_due_date: '2025-01-10', administered_by: 'Dr. Sarah Chen', batch_number: 'RAB-2024-001', notes: 'Annual booster' },
  { id: uuidv4(), pet_id: luna.id, vaccine_name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', date_administered: '2024-01-10', next_due_date: '2025-01-10', administered_by: 'Dr. Sarah Chen', batch_number: 'DHPP-2024-045', notes: 'Annual booster' },
  { id: uuidv4(), pet_id: luna.id, vaccine_name: 'Bordetella', date_administered: '2023-07-15', next_due_date: '2024-07-15', administered_by: 'Dr. Sarah Chen', batch_number: 'BORD-2023-212', notes: 'Required for boarding' },
  { id: uuidv4(), pet_id: mochi.id, vaccine_name: 'FVRCP (Feline Distemper)', date_administered: '2024-02-20', next_due_date: '2025-02-20', administered_by: 'Dr. James Park', batch_number: 'FVRCP-2024-088', notes: 'Annual booster' },
  { id: uuidv4(), pet_id: mochi.id, vaccine_name: 'Rabies', date_administered: '2024-02-20', next_due_date: '2026-02-20', administered_by: 'Dr. James Park', batch_number: 'RAB-2024-102', notes: '3-year vaccine administered' },
  { id: uuidv4(), pet_id: mochi.id, vaccine_name: 'FeLV (Feline Leukemia)', date_administered: '2023-06-12', next_due_date: '2024-06-12', administered_by: 'Dr. James Park', batch_number: 'FELV-2023-055', notes: 'Recommended for indoor cats in multi-cat households' },
  { id: uuidv4(), pet_id: pebbles.id, vaccine_name: 'RHDV2 (Rabbit Hemorrhagic Disease)', date_administered: '2024-03-05', next_due_date: '2025-03-05', administered_by: 'Dr. Emily Torres', batch_number: 'RHDV-2024-017', notes: 'Annual vaccination' },
];

const insertVaccination = db.prepare(`
  INSERT INTO vaccinations (id, pet_id, vaccine_name, date_administered, next_due_date, administered_by, batch_number, notes)
  VALUES (@id, @pet_id, @vaccine_name, @date_administered, @next_due_date, @administered_by, @batch_number, @notes)
`);

for (const v of vaccinations) {
  insertVaccination.run(v);
}

// Appointments
const appointments = [
  { id: uuidv4(), pet_id: luna.id, title: 'Annual Wellness Exam', appointment_type: 'checkup', date: '2026-03-15', time: '10:00', vet_name: 'Dr. Sarah Chen', clinic_name: 'Happy Paws Veterinary Clinic', notes: 'Annual checkup + vaccine boosters due', status: 'scheduled' },
  { id: uuidv4(), pet_id: luna.id, title: 'Dental Cleaning', appointment_type: 'dental', date: '2026-04-02', time: '09:00', vet_name: 'Dr. Sarah Chen', clinic_name: 'Happy Paws Veterinary Clinic', notes: 'Pre-anesthesia bloodwork required', status: 'scheduled' },
  { id: uuidv4(), pet_id: mochi.id, title: 'Wellness Check', appointment_type: 'checkup', date: '2026-02-28', time: '14:30', vet_name: 'Dr. James Park', clinic_name: 'Feline Friends Animal Hospital', notes: 'Check FeLV vaccination status', status: 'scheduled' },
  { id: uuidv4(), pet_id: mochi.id, title: 'Ear Infection Follow-up', appointment_type: 'followup', date: '2026-01-18', time: '11:00', vet_name: 'Dr. James Park', clinic_name: 'Feline Friends Animal Hospital', notes: 'Responded well to treatment', status: 'completed' },
  { id: uuidv4(), pet_id: pebbles.id, title: 'Routine Checkup', appointment_type: 'checkup', date: '2026-03-20', time: '16:00', vet_name: 'Dr. Emily Torres', clinic_name: 'Small Critters Exotic Vet', notes: 'Dental check and weight assessment', status: 'scheduled' },
];

const insertAppointment = db.prepare(`
  INSERT INTO appointments (id, pet_id, title, appointment_type, date, time, vet_name, clinic_name, notes, status)
  VALUES (@id, @pet_id, @title, @appointment_type, @date, @time, @vet_name, @clinic_name, @notes, @status)
`);

for (const a of appointments) {
  insertAppointment.run(a);
}

// Weight Records
const weightRecords = [
  { id: uuidv4(), pet_id: luna.id, weight: 28.5, unit: 'kg', recorded_at: '2024-01-10', notes: 'Post-holiday weight check' },
  { id: uuidv4(), pet_id: luna.id, weight: 27.8, unit: 'kg', recorded_at: '2024-04-15', notes: '' },
  { id: uuidv4(), pet_id: luna.id, weight: 27.2, unit: 'kg', recorded_at: '2024-07-20', notes: 'Good progress on diet' },
  { id: uuidv4(), pet_id: luna.id, weight: 26.9, unit: 'kg', recorded_at: '2024-10-05', notes: '' },
  { id: uuidv4(), pet_id: luna.id, weight: 27.0, unit: 'kg', recorded_at: '2025-01-15', notes: 'Stable weight' },
  { id: uuidv4(), pet_id: mochi.id, weight: 4.8, unit: 'kg', recorded_at: '2024-02-20', notes: 'Slightly overweight, monitor diet' },
  { id: uuidv4(), pet_id: mochi.id, weight: 4.6, unit: 'kg', recorded_at: '2024-05-10', notes: '' },
  { id: uuidv4(), pet_id: mochi.id, weight: 4.5, unit: 'kg', recorded_at: '2024-08-22', notes: 'Good progress' },
  { id: uuidv4(), pet_id: mochi.id, weight: 4.4, unit: 'kg', recorded_at: '2024-11-15', notes: '' },
  { id: uuidv4(), pet_id: pebbles.id, weight: 1.8, unit: 'kg', recorded_at: '2024-03-05', notes: 'First vet visit weight' },
  { id: uuidv4(), pet_id: pebbles.id, weight: 1.9, unit: 'kg', recorded_at: '2024-06-18', notes: '' },
  { id: uuidv4(), pet_id: pebbles.id, weight: 2.0, unit: 'kg', recorded_at: '2024-09-10', notes: 'Healthy growth' },
];

const insertWeight = db.prepare(`
  INSERT INTO weight_records (id, pet_id, weight, unit, recorded_at, notes)
  VALUES (@id, @pet_id, @weight, @unit, @recorded_at, @notes)
`);

for (const w of weightRecords) {
  insertWeight.run(w);
}

// Medications
const medications = [
  { id: uuidv4(), pet_id: luna.id, name: 'NexGard (Afoxolaner)', dosage: '68mg chewable tablet', frequency: 'Monthly', start_date: '2024-01-01', end_date: null, prescribed_by: 'Dr. Sarah Chen', purpose: 'Flea and tick prevention', active: 1, notes: 'Give with food' },
  { id: uuidv4(), pet_id: luna.id, name: 'Heartgard Plus', dosage: '1 chewable (51-100 lbs)', frequency: 'Monthly', start_date: '2024-01-01', end_date: null, prescribed_by: 'Dr. Sarah Chen', purpose: 'Heartworm prevention', active: 1, notes: '' },
  { id: uuidv4(), pet_id: luna.id, name: 'Apoquel (Oclacitinib)', dosage: '16mg', frequency: 'Daily', start_date: '2023-05-10', end_date: '2023-08-10', prescribed_by: 'Dr. Sarah Chen', purpose: 'Seasonal allergy relief', active: 0, notes: 'Completed course. Monitor for recurrence in spring' },
  { id: uuidv4(), pet_id: mochi.id, name: 'Revolution Plus', dosage: '0.25ml topical', frequency: 'Monthly', start_date: '2024-03-01', end_date: null, prescribed_by: 'Dr. James Park', purpose: 'Flea, tick, and heartworm prevention', active: 1, notes: 'Apply between shoulder blades' },
  { id: uuidv4(), pet_id: mochi.id, name: 'Otomax Ear Drops', dosage: '4 drops per ear', frequency: 'Twice daily', start_date: '2026-01-10', end_date: '2026-01-25', prescribed_by: 'Dr. James Park', purpose: 'Ear infection treatment', active: 0, notes: 'Completed successfully' },
  { id: uuidv4(), pet_id: pebbles.id, name: 'Oxbow Critical Care', dosage: '50ml', frequency: 'Twice daily as needed', start_date: '2024-09-15', end_date: '2024-10-01', prescribed_by: 'Dr. Emily Torres', purpose: 'Recovery nutrition supplement', active: 0, notes: 'Given during recovery from GI stasis' },
];

const insertMedication = db.prepare(`
  INSERT INTO medications (id, pet_id, name, dosage, frequency, start_date, end_date, prescribed_by, purpose, active, notes)
  VALUES (@id, @pet_id, @name, @dosage, @frequency, @start_date, @end_date, @prescribed_by, @purpose, @active, @notes)
`);

for (const m of medications) {
  insertMedication.run(m);
}

// Health Conditions
const conditions = [
  { id: uuidv4(), pet_id: luna.id, condition_name: 'Seasonal Allergies', diagnosed_date: '2023-05-10', diagnosed_by: 'Dr. Sarah Chen', severity: 'mild', status: 'managed', treatment: 'Apoquel as needed during allergy season', notes: 'Primarily affects spring/summer' },
  { id: uuidv4(), pet_id: mochi.id, condition_name: 'Otitis Externa (Ear Infection)', diagnosed_date: '2026-01-10', diagnosed_by: 'Dr. James Park', severity: 'mild', status: 'resolved', treatment: 'Otomax ear drops for 2 weeks', notes: 'Responded well to treatment' },
  { id: uuidv4(), pet_id: pebbles.id, condition_name: 'GI Stasis', diagnosed_date: '2024-09-15', diagnosed_by: 'Dr. Emily Torres', severity: 'moderate', status: 'resolved', treatment: 'Fluid therapy, Critical Care feeding, gut motility drugs', notes: 'Full recovery. Monitor diet and hay intake closely' },
];

const insertCondition = db.prepare(`
  INSERT INTO health_conditions (id, pet_id, condition_name, diagnosed_date, diagnosed_by, severity, status, treatment, notes)
  VALUES (@id, @pet_id, @condition_name, @diagnosed_date, @diagnosed_by, @severity, @status, @treatment, @notes)
`);

for (const c of conditions) {
  insertCondition.run(c);
}

console.log('Database seeded successfully!');
console.log(`  - ${pets.length} pets`);
console.log(`  - ${vaccinations.length} vaccinations`);
console.log(`  - ${appointments.length} appointments`);
console.log(`  - ${weightRecords.length} weight records`);
console.log(`  - ${medications.length} medications`);
console.log(`  - ${conditions.length} health conditions`);
