import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db';

async function seed() {
  console.log('🌱 Seeding real Google Sheet & Drive records to Neon PostgreSQL...');

  try {
    // 1. Seed Default Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pawsnhearts.org').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'PawsRescue2026!';
    const adminName = process.env.ADMIN_NAME || 'Rescue Coordinator';

    const existingAdmin = await query('SELECT id FROM admin_users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await query(
        `INSERT INTO admin_users (email, password_hash, name, role)
         VALUES ($1, $2, $3, 'admin')`,
        [adminEmail, passwordHash, adminName]
      );
      console.log(`✅ Admin account created: ${adminEmail}`);
      console.log(`🔑 Default Password: ${adminPassword}`);
    }

    // 2. Seed Default Site Settings
    const defaultSettings = [
      { key: 'upi_id', value: 'salesabshappypaws@oksbi' },
      { key: 'payee_name', value: 'PawsAndHearts' },
      { key: 'contact_phone', value: '+91 7217739614' },
      { key: 'contact_location', value: 'BLR, India' },
      { key: 'emergency_banner', value: '🐾 All previously rescued street dogs have been successfully treated, healed & adopted!' },
      { key: 'enable_donations', value: true },
    ];

    for (const item of defaultSettings) {
      await query(
        `INSERT INTO site_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [item.key, JSON.stringify(item.value)]
      );
    }

    // 3. Real Dogs from Google Drive & Sheets (all healed / adopted)
    const realAnimals = [
      {
        name: 'Chikoo',
        slug: 'chikoo',
        category: 'adoption',
        status: 'adopted',
        tags: ['Adopted ❤️', '9 Months Old', 'Indie Puppy'],
        short_desc: 'Energetic Indie pup found near a highway, now happily adopted!',
        full_story: 'Chikoo was found roaming near a highway junction, scared and hungry. After a gentle bath, deworming, and core vaccinations, he transformed into a radiant bundle of joy and found his forever home!',
        medical_details: 'Fully vaccinated (DHPPi + Anti-Rabies), dewormed, neutered.',
        funds_needed: 4500,
        funds_raised: 4500,
        hero_image: 'https://drive.google.com/thumbnail?id=1lCBFE5X6p11dOYpdbE3e8K6QhOrl786F&sz=w800',
        is_featured: true,
        sort_order: 1,
      },
      {
        name: 'Milo & Lilly',
        slug: 'milo-and-lilly',
        category: 'adoption',
        status: 'adopted',
        tags: ['Adopted ❤️', 'Kumhara Park Rescue', 'Sewer Survivor Pups'],
        short_desc: 'Saved from a narrow sewer drain during heavy rain with mama dog, now happily adopted!',
        full_story: 'Rescued after an 8-9 hour operation in the pouring rain out of a sewer line in Kumhara park. Both Milo & Lilly completed their vaccinations and have now been happily adopted into caring forever homes!',
        medical_details: 'Core puppy vaccines, flea & tick treatment, deworming completed.',
        funds_needed: 1500,
        funds_raised: 1500,
        hero_image: 'https://drive.google.com/thumbnail?id=1dmMlc17FDfpIyGcyBYTUHliZZX0A_8rF&sz=w800',
        is_featured: true,
        sort_order: 2,
      },
      {
        name: 'Snoopy',
        slug: 'snoopy',
        category: 'treatment',
        status: 'recovered',
        tags: ['Treated & Recovered ❤️', 'Broken Leg Healed', 'Hit & Run Survivor'],
        short_desc: 'One month old puppy hit by a vehicle with broken legs, now 100% healed and running!',
        full_story: 'Snoopy was barely 1 month old when struck by a reckless vehicle, leaving both legs fractured and in extreme agony. Rushed to emergency veterinary care, orthopedic splints and daily antibiotic dressings were applied. Today Snoopy has made a miraculous recovery, walking and playing with boundless energy!',
        medical_details: 'Consultation with orthopaedic vet, leg splinting, calcium bone therapy, anti-inflammatory and pain medications. Treatment receipt available.',
        funds_needed: 5000,
        funds_raised: 5000,
        hero_image: 'https://drive.google.com/thumbnail?id=1XDOCMNwiHkbKWq-FT-E2vZKJFpXEAtAE&sz=w800',
        is_featured: true,
        sort_order: 3,
      },
      {
        name: 'Snowy',
        slug: 'snowy',
        category: 'treatment',
        status: 'recovered',
        tags: ['Treated & Recovered ❤️', 'Wound Healed', 'Puppy Survivor'],
        short_desc: 'One month old puppy rescued from roadside vehicle impact with bruises, fully rehabilitated!',
        full_story: 'Snowy suffered deep bruises and bleeding soft-tissue wounds from a roadside accident. With daily wound cleaning, antibiotic ointments, and nutritional supplements, Snowy made a swift and complete recovery.',
        medical_details: 'Antiseptic dressings, wound suturing, antibiotic course, core puppy booster.',
        funds_needed: 2000,
        funds_raised: 2000,
        hero_image: 'https://drive.google.com/thumbnail?id=18oZkTq3A2ybHf8N9xURpMeFO7j1WKO4Z&sz=w800',
        is_featured: false,
        sort_order: 4,
      },
      {
        name: 'Brownie',
        slug: 'brownie',
        category: 'treatment',
        status: 'recovered',
        tags: ['Treated & Recovered ❤️', 'Drip & Bandages', 'Fully Healed'],
        short_desc: 'Underwent daily intravenous drips and bandage changes, fully healed and energetic!',
        full_story: 'Brownie was rescued severely dehydrated with infected abrasions. Placed on daily IV fluid therapy and sterile bandages, Brownie regained vitality and is now in peak physical health!',
        medical_details: 'Daily saline drip, electrolyte rehydration, sterile bandage changes and multi-vitamins.',
        funds_needed: 2000,
        funds_raised: 2000,
        hero_image: 'https://drive.google.com/thumbnail?id=1xv9svVcgzwi9NDpRNJrMyrSaIi7-SG_h&sz=w800',
        is_featured: false,
        sort_order: 5,
      },
    ];

    for (const a of realAnimals) {
      const res = await query(
        `INSERT INTO animals (
          name, slug, category, status, tags, short_desc, full_story,
          medical_details, funds_needed, funds_raised, hero_image, is_featured, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (slug) DO UPDATE SET
          status = EXCLUDED.status,
          hero_image = EXCLUDED.hero_image,
          full_story = EXCLUDED.full_story
        RETURNING id`,
        [
          a.name, a.slug, a.category, a.status, a.tags,
          a.short_desc, a.full_story, a.medical_details,
          a.funds_needed, a.funds_raised, a.hero_image,
          a.is_featured, a.sort_order
        ]
      );

      const animalId = res.rows[0].id;
      await query(
        `INSERT INTO animal_media (animal_id, media_type, url, caption, sort_order)
         VALUES ($1, 'image', $2, 'Rescue Photo', 0)
         ON CONFLICT DO NOTHING`,
        [animalId, a.hero_image]
      );
    }

    // 4. Real Verified Ledger Donations from Google Sheet
    const realLedger = [
      { donor: 'Ansh', amt: 2000, date: '2026-02-24', notes: 'Sponsorship for puppy medical care' },
      { donor: 'Simran', amt: 550, date: '2026-02-24', notes: 'Support for Snoopy recovery' },
      { donor: 'Akansha', amt: 2000, date: '2026-02-21', notes: 'Emergency vet bills fund' },
      { donor: 'Vidish', amt: 1000, date: '2026-02-21', notes: 'Food and puppy nourishment' },
      { donor: 'Saksham', amt: 500, date: '2026-02-20', notes: 'Initial rescue launch donation' },
      { donor: 'Bhumi Ghabrani', amt: 500, date: '2026-02-22', notes: 'Medical support' },
      { donor: 'Deepika', amt: 500, date: '2026-02-22', notes: 'Puppy vaccines' },
      { donor: 'Mansi', amt: 500, date: '2026-02-23', notes: 'Vet care' },
      { donor: 'Arpit', amt: 500, date: '2026-02-23', notes: 'Rescue rehabilitation' },
      { donor: 'Manya Arora', amt: 500, date: '2026-02-20', notes: 'Care fund' },
      { donor: 'Vibhav Bhardwaj', amt: 500, date: '2026-02-20', notes: 'Vet medical expenses' },
      { donor: 'Sunny', amt: 300, date: '2026-02-20', notes: 'Puppy medicine' },
      { donor: 'Jhalak', amt: 300, date: '2026-02-21', notes: 'Care sponsorship' },
      { donor: 'Lalit', amt: 251, date: '2026-02-23', notes: 'Support for rescues' },
      { donor: 'Senpai7', amt: 250, date: '2026-02-20', notes: 'Vaccine fund' },
      { donor: 'Happy', amt: 200, date: '2026-02-23', notes: 'Food treats' },
      { donor: 'Yash jindal', amt: 200, date: '2026-02-23', notes: 'Medical support' },
      { donor: 'Soham', amt: 200, date: '2026-02-20', notes: 'Rescue relief' },
    ];

    for (const l of realLedger) {
      await query(
        `INSERT INTO ledger_entries (
          donor_name, amount, entry_type, payment_method, is_verified, transaction_date, notes
        ) VALUES ($1, $2, 'donation', 'UPI', true, $3, $4)`,
        [l.donor, l.amt, l.date, l.notes]
      );
    }

    console.log('✅ Real Google Sheet records seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
