require('dotenv').config();
const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    console.log('\nSyncing database models...');
    await sequelize.sync();
    console.log('✅ Database models synced');

    console.log('\nCreating demo users...');

    // ================= ADMIN =================
    let admin = await User.findOne({ where: { email: 'admin@yaacoub.ma' } });

    if (!admin) {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@yaacoub.ma',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'admin',
        phone: '+212 XXX XXX XXX',
        isActive: true
      });
      console.log('✅ Admin created');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // ================= EMPLOYEE =================
    let employee = await User.findOne({ where: { email: 'employee@yaacoub.ma' } });

    if (!employee) {
      employee = await User.create({
        firstName: 'Employee',
        lastName: 'User',
        email: 'employee@yaacoub.ma',
        password: await bcrypt.hash('Employee123!', 10),
        role: 'employee',
        department: 'Civil Registry',
        position: 'Document Officer',
        phone: '+212 XXX XXX XXX',
        isActive: true
      });
      console.log('✅ Employee created');
    } else {
      console.log('ℹ️ Employee already exists');
    }

    // ================= CITIZEN =================
    let citizen = await User.findOne({ where: { email: 'fatima.alaoui@email.com' } });

    if (!citizen) {
      citizen = await User.create({
        firstName: 'Fatima',
        lastName: 'Alaoui',
        email: 'fatima.alaoui@email.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'citizen',
        nationalId: 'A123456789',
        address: 'Rabat, Morocco',
        phone: '+212 XXX XXX XXX',
        isActive: true
      });
      console.log('✅ Citizen created');
    } else {
      console.log('ℹ️ Citizen already exists');
    }

    // ================= DISPLAY =================
    console.log('\n📋 Demo Accounts:');
    console.log('Admin:    admin@yaacoub.ma / Admin123!');
    console.log('Employee: employee@yaacoub.ma / Employee123!');
    console.log('Citizen:  fatima.alaoui@email.com / Password123!');

    console.log('\n✅ Database ready!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();