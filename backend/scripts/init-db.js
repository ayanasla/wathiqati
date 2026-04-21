require('dotenv').config();
const { sequelize, User, Request } = require('../models');

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection successful');

    console.log('Syncing database models...');
    await sequelize.sync({ force: true }); // Force sync for clean setup
    console.log('Database models synced');

    console.log('Creating demo users...');

    // Create admin user for Yaacoub El Mansour municipality
    const admin = await User.create({
      firstName: 'Ahmed',
      lastName: 'Bennani',
      email: 'admin@yaacoub.ma',
      password: 'Admin123!',
      role: 'admin',
      municipality: 'Yaacoub El Mansour',
      isActive: true
    });

    // Create regular users
    const user1 = await User.create({
      firstName: 'Fatima',
      lastName: 'Alaoui',
      email: 'fatima.alaoui@email.com',
      password: 'Password123!',
      role: 'citizen',
      isActive: true
    });

    const user2 = await User.create({
      firstName: 'Mohammed',
      lastName: 'Tazi',
      email: 'mohammed.tazi@email.com',
      password: 'Password123!',
      role: 'citizen',
      isActive: true
    });

    console.log('Creating demo requests...');

    // Create some sample requests
    await Request.create({
      userId: user1.id,
      documentType: 'Birth Certificate',
      requestNumber: 'REQ-001',
      municipality: 'Yaacoub El Mansour',
      description: 'Request for birth certificate copy',
      firstNameFr: 'Fatima',
      lastNameFr: 'Alaoui',
      firstNameAr: 'فاطمة',
      lastNameAr: 'العلوي',
      dateOfBirth: '1992-04-01',
      nationalId: 'A123456789',
      status: 'pending'
    });

    await Request.create({
      userId: user1.id,
      documentType: 'ID Card',
      requestNumber: 'REQ-002',
      municipality: 'Yaacoub El Mansour',
      description: 'Renewal of national ID card',
      firstNameFr: 'Fatima',
      lastNameFr: 'Alaoui',
      firstNameAr: 'فاطمة',
      lastNameAr: 'العلوي',
      dateOfBirth: '1992-04-01',
      nationalId: 'A123456789',
      status: 'pending'
    });

    await Request.create({
      userId: user2.id,
      documentType: 'Residence Certificate',
      requestNumber: 'REQ-003',
      municipality: 'Yaacoub El Mansour',
      description: 'Certificate of residence for administrative purposes',
      firstNameFr: 'Mohammed',
      lastNameFr: 'Tazi',
      firstNameAr: 'محمد',
      lastNameAr: 'الطازي',
      dateOfBirth: '1988-07-20',
      nationalId: 'B987654321',
      status: 'pending'
    });

    console.log('Demo data created successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@yaacoub.ma / Admin123!');
    console.log('User1: fatima.alaoui@email.com / Password123!');
    console.log('User2: mohammed.tazi@email.com / Password123!');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();