const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.serviceEvidence.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.zoneSupportRequest.deleteMany();
  await prisma.serviceZone.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating Zones...');
  const zoneA = await prisma.serviceZone.create({ data: { name: 'Mumbai North', centerLat: 19.1834, centerLng: 72.8353, radiusKm: 15 } });
  const zoneB = await prisma.serviceZone.create({ data: { name: 'Mumbai South', centerLat: 18.9388, centerLng: 72.8258, radiusKm: 10 } });

  console.log('Creating Categories and Subcategories...');
  const catPlumbing = await prisma.category.create({
    data: {
      name: 'Plumbing',
      icon: 'Droplets',
      subcategories: {
        create: [{ name: 'Pipe Leakage' }, { name: 'Tap Repair' }, { name: 'Drain Blockage' }]
      }
    },
    include: { subcategories: true }
  });

  const catElectrician = await prisma.category.create({
    data: {
      name: 'Electrician',
      icon: 'Zap',
      subcategories: {
        create: [{ name: 'AC Repair' }, { name: 'Wiring' }, { name: 'Switchboard' }]
      }
    },
    include: { subcategories: true }
  });

  const hash = await bcrypt.hash('password123', 10);

  console.log('Creating Admin...');
  await prisma.user.create({
    data: {
      name: 'Admin User',
      mobile: '9999999999',
      email: 'admin@sih.gov',
      passwordHash: hash,
      role: 'ADMIN',
    }
  });

  console.log('Creating Cooperative...');
  const coop = await prisma.cooperative.create({
    data: {
      name: 'Mumbai Labour Fed',
      registrationNo: 'MH-COOP-001',
      address: 'Dadar, Mumbai',
      contactEmail: 'coop@mumbai.in',
      contactPhone: '8888888888',
      isActive: true,
      verificationStatus: 'VERIFIED'
    }
  });

  console.log('Creating Workers...');
  // Worker 1 (Plumber - High Workload)
  const w1User = await prisma.user.create({ data: { name: 'Ramesh Plumber', mobile: '1111111111', passwordHash: hash, role: 'WORKER' } });
  const w1 = await prisma.workerProfile.create({
    data: {
      userId: w1User.id,
      cooperativeId: coop.id,
      categoryId: catPlumbing.id,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      baseLocation: 'Andheri',
      latitude: 19.1136,
      longitude: 72.8697
    }
  });

  // Worker 2 (Plumber - Low Workload)
  const w2User = await prisma.user.create({ data: { name: 'Suresh Plumber', mobile: '2222222222', passwordHash: hash, role: 'WORKER' } });
  const w2 = await prisma.workerProfile.create({
    data: {
      userId: w2User.id,
      cooperativeId: coop.id,
      categoryId: catPlumbing.id,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      baseLocation: 'Borivali',
      latitude: 19.2307,
      longitude: 72.8567
    }
  });

  // Worker 3 (Electrician)
  const w3User = await prisma.user.create({ data: { name: 'Ajay Electrician', mobile: '3333333333', passwordHash: hash, role: 'WORKER' } });
  const w3 = await prisma.workerProfile.create({
    data: {
      userId: w3User.id,
      cooperativeId: coop.id,
      categoryId: catElectrician.id,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      baseLocation: 'Colaba',
      latitude: 18.9067,
      longitude: 72.8147
    }
  });

  console.log('Creating Customers...');
  const c1User = await prisma.user.create({ data: { name: 'Priya Customer', mobile: '4444444444', passwordHash: hash, role: 'CUSTOMER' } });
  const c1 = await prisma.customerProfile.create({ data: { userId: c1User.id, defaultAddress: 'Bandra West', latitude: 19.0596, longitude: 72.8295 } });

  console.log('Creating Historical Bookings (Workload data)...');
  // Give Worker 1 High Workload
  for (let i = 0; i < 8; i++) {
    const b = await prisma.booking.create({
      data: {
        customerId: c1User.id,
        workerId: w1User.id,
        categoryId: catPlumbing.id,
        subcategoryId: catPlumbing.subcategories[0].id,
        zoneId: zoneA.id,
        address: 'Bandra',
        latitude: 19.05,
        longitude: 72.82,
        scheduledDate: new Date(),
        status: 'PAID',
        basePrice: 500,
        finalAmount: 500,
        price: 500
      }
    });
    
    const p = await prisma.payment.create({
      data: { bookingId: b.id, customerId: c1User.id, workerId: w1User.id, amount: 500, status: 'SUCCESS', paymentMethod: 'UPI' }
    });
    
    await prisma.invoice.create({
      data: { bookingId: b.id, paymentId: p.id, invoiceNumber: 'INV-2026-' + (1000+i), amount: 500, status: 'PAID' }
    });
  }

  // Give Worker 2 Low Workload (only 1 job)
  const bLow = await prisma.booking.create({
    data: {
      customerId: c1User.id,
      workerId: w2User.id,
      categoryId: catPlumbing.id,
      subcategoryId: catPlumbing.subcategories[1].id,
      zoneId: zoneA.id,
      address: 'Andheri',
      latitude: 19.11,
      longitude: 72.86,
      scheduledDate: new Date(),
      status: 'PAID',
      basePrice: 300,
      finalAmount: 300,
      price: 300
    }
  });
  const pLow = await prisma.payment.create({
    data: { bookingId: bLow.id, customerId: c1User.id, workerId: w2User.id, amount: 300, status: 'SUCCESS', paymentMethod: 'UPI' }
  });
  await prisma.invoice.create({
    data: { bookingId: bLow.id, paymentId: pLow.id, invoiceNumber: 'INV-2026-9999', amount: 300, status: 'PAID' }
  });

  // Emergency Request (Active)
  await prisma.booking.create({
    data: {
      customerId: c1User.id,
      categoryId: catElectrician.id,
      subcategoryId: catElectrician.subcategories[2].id,
      zoneId: zoneB.id,
      address: 'Colaba Market',
      latitude: 18.91,
      longitude: 72.81,
      scheduledDate: new Date(),
      status: 'PENDING',
      isEmergency: true,
      basePrice: 500,
      emergencySurcharge: 150,
      price: 650
    }
  });

  console.log('Seed completed! Database is ready for SIH Final Demo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
