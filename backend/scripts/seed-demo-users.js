#!/usr/bin/env node

/**
 * Database Seed Script - Create Demo Users
 * Creates test users with valid credentials for development/testing
 * 
 * Usage:
 *   npm run db:seed
 *   node scripts/seed-demo-users.js
 */

require('dotenv').config();
const path = require('path');
const { sequelize, User } = require(path.join(__dirname, '../models'));

async function seedDemoUsers() {
  try {
    console.log('🌱 Seeding database with demo users...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@yaacoub.ma',
      password: 'Admin123!',
      role: 'admin',
      phone: '+212 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Admin user created:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   🔐 Password: Admin123!`);
    console.log(`   👤 Role: admin\n`);

    // Create employee user
    const employee = await User.create({
      firstName: 'Karim',
      lastName: 'Employee',
      email: 'employee@yaacoub.ma',
      password: 'Employee123!',
      role: 'employee',
      department: 'Civil Registry',
      position: 'Document Officer',
      phone: '+212 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Employee user created:');
    console.log(`   📧 Email: ${employee.email}`);
    console.log(`   🔐 Password: Employee123!`);
    console.log(`   👤 Role: employee`);
    console.log(`   🏢 Department: ${employee.department}\n`);

    // Create citizen user
    const citizen = await User.create({
      firstName: 'Fatima',
      lastName: 'Alaoui',
      email: 'fatima.alaoui@email.com',
      password: 'Password123!',
      role: 'citizen',
      nationalId: 'A123456789',
      address: 'Algiers, Algeria',
      phone: '+212 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Citizen user created:');
    console.log(`   📧 Email: ${citizen.email}`);
    console.log(`   🔐 Password: Password123!`);
    console.log(`   👤 Role: citizen`);
    console.log(`   🆔 National ID: ${citizen.nationalId}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📋 Available Demo Accounts:');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ Role     │ Email                        │ Password  │');
    console.log('   ├──────────┼──────────────────────────────┼───────────┤');
    console.log('   │ Admin    │ admin@yaacoub.ma             │ Admin123! │');
    console.log('   │ Employee │ employee@yaacoub.ma          │ Employee..│');
    console.log('   │ Citizen  │ fatima.alaoui@email.com      │ Password..│');
    console.log('   └─────────────────────────────────────────────────┘\n');

    console.log('💡 Next steps:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm start');
    console.log('   3. Go to http://localhost:3000/login');
    console.log('   4. Try logging in with any of the above credentials\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('\nDetailed error:');
    console.error(error);
    process.exit(1);
  }
}

seedDemoUsers();
