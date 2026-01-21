const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...');

    // 1. Create Police Stations
    const station1 = await prisma.policeStation.create({
        data: {
            station_name: 'Central Police Station',
            location: '123 Main St, Downtown',
            contact_number: '100-101'
        }
    });

    const station2 = await prisma.policeStation.create({
        data: {
            station_name: 'North Division Station',
            location: '456 North Ave, Uptown',
            contact_number: '100-102'
        }
    });

    console.log('✅ Stations created');

    // 2. Create Officers
    const password = await bcrypt.hash('password123', 10);

    const officer1 = await prisma.policeOfficer.create({
        data: {
            full_name: 'Inspector Vijay',
            badge_number: 'COP-001',
            email: 'vijay@police.com',
            password_hash: password,
            rank: 'Inspector',
            station_id: station1.station_id
        }
    });

    const officer2 = await prisma.policeOfficer.create({
        data: {
            full_name: 'Sub-Inspector Ravi',
            badge_number: 'COP-002',
            email: 'ravi@police.com',
            password_hash: password,
            rank: 'Sub-Inspector',
            station_id: station1.station_id
        }
    });

    const officer3 = await prisma.policeOfficer.create({
        data: {
            full_name: 'Inspector Priya',
            badge_number: 'COP-003',
            email: 'priya@police.com',
            password_hash: password,
            rank: 'Inspector',
            station_id: station2.station_id
        }
    });

    console.log('✅ Officers created');

    // 3. Create a Victim
    const victim = await prisma.victim.create({
        data: {
            full_name: 'Rahul Sharma',
            email: 'rahul@example.com',
            password_hash: password,
            phone_number: '9876543210',
            address: '77 Sunset Blvd'
        }
    });

    console.log('✅ Victim created');

    // 4. Create a Sample Complaint
    const complaint = await prisma.complaint.create({
        data: {
            victim_id: victim.victim_id,
            station_id: station1.station_id,
            assigned_officer_id: officer1.officer_id,
            title: 'Lost Wallet at Metro Station',
            description: 'I lost my brown leather wallet containing my ID and cards at the central metro station around 5 PM.',
            incident_location: 'Central Metro Station',
            category: 'THEFT',
            severity_level: 'LOW',
            current_status: 'PENDING',
            visibility: 'PRIVATE'
        }
    });

    console.log(`✅ Sample Complaint created with ID: ${complaint.complaint_id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
