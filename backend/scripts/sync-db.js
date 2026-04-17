#!/usr/bin/env node

/**
 * Database Sync Script
 * Synchronizes Sequelize models with the database
 * 
 * Usage:
 *   npm run db:sync              # Sync (alter table if exists)
 *   npm run db:sync:force        # Drop all tables and resync (development only)
 *   npm run db:seed              # Sync and seed sample data
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { testConnection } = require('../config/database');

// Import all models
const {
  User,
  DocumentType,
  Document,
  Request,
  Task,
  Notification,
} = require('../models');

/**
 * Sync Database
 * Options:
 *   force: false  -> ALTER existing tables
 *   force: true   -> DROP and CREATE all tables (DESTRUCTIVE - development only)
 */
const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Starting database synchronization...\n');

    // Display sync options
    if (options.force) {
      console.warn('⚠️  WARNING: Running with force=true - ALL TABLES WILL BE DROPPED AND RECREATED');
      console.warn('⚠️  This is for DEVELOPMENT ONLY!\n');
    }

    // Test connection first
    await testConnection();
    console.log('');

    // Sync models
    await sequelize.sync({
      force: options.force || false,
      alter: !options.force,
      logging: (sql) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SQL]', sql);
        }
      },
    });

    console.log('✅ Database synchronization completed successfully!\n');

    // Display created tables
    console.log('📋 Tables created/updated:');
    console.log('   - users');
    console.log('   - documentTypes');
    console.log('   - documents');
    console.log('   - requests');
    console.log('   - tasks');
    console.log('   - notifications\n');

    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

/**
 * Seed Database with Sample Data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...\n');

    // Check if admin user exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (adminExists) {
      console.log('⏭️  Admin user already exists. Skipping seed.');
      return;
    }

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@wathiqati.com',
      password: 'Admin@123456', // Will be hashed by setter
      role: 'admin',
      phone: '+213 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Admin user created:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@123456\n`);

    // Create sample employee
    const employee = await User.create({
      firstName: 'Karim',
      lastName: 'Employee',
      email: 'employee@wathiqati.com',
      password: 'Employee@123456',
      role: 'employee',
      department: 'Civil Registry',
      position: 'Document Officer',
      phone: '+213 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Employee user created:');
    console.log(`   Email: ${employee.email}`);
    console.log(`   Department: ${employee.department}\n`);

    // Create sample citizen
    const citizen = await User.create({
      firstName: 'Ahmed',
      lastName: 'Citizen',
      email: 'citizen@wathiqati.com',
      password: 'Citizen@123456',
      role: 'citizen',
      nationalId: '12345678901234',
      address: 'Algiers, Algeria',
      phone: '+213 XXX XXX XXX',
      isActive: true,
    });
    console.log('✅ Citizen user created:');
    console.log(`   Email: ${citizen.email}`);
    console.log(`   National ID: ${citizen.nationalId}\n`);

    // Create document types
    const documentTypes = await DocumentType.bulkCreate([
      {
        name: 'Birth Certificate',
        code: 'BC001',
        description: 'Official birth certificate',
        processingTime: 5,
        price: 50.00,
        isActive: true,
        requirementsFr: 'Identification valide',
        requirementsAr: 'وثيقة هوية صحيحة',
      },
      {
        name: 'Marriage Certificate',
        code: 'MC001',
        description: 'Official marriage certificate',
        processingTime: 7,
        price: 75.00,
        isActive: true,
        requirementsFr: 'Pièces d\'identité des époux',
        requirementsAr: 'وثائق هوية الزوجين',
      },
      {
        name: 'Death Certificate',
        code: 'DC001',
        description: 'Official death certificate',
        processingTime: 3,
        price: 40.00,
        isActive: true,
        requirementsFr: 'Rapport médical',
        requirementsAr: 'تقرير طبي',
      },
      {
        name: 'Criminal Record',
        code: 'CR001',
        description: 'Criminal record certificate',
        processingTime: 10,
        price: 100.00,
        isActive: true,
        requirementsFr: 'Identification valide',
        requirementsAr: 'وثيقة هوية صحيحة',
      },
    ]);
    console.log('✅ Document types created:');
    documentTypes.forEach(dt => console.log(`   - ${dt.code}: ${dt.name}`));
    console.log('');

    // Create sample request
    const request = await Request.create({
      requestNumber: `REQ-${Date.now()}`,
      status: 'pending',
      priority: 'medium',
      userId: citizen.id,
      requestType: 'Birth Certificate',
      purpose: 'For school registration',
      firstNameFr: 'Ahmed',
      lastNameFr: 'Ali',
      firstNameAr: 'أحمد',
      lastNameAr: 'علي',
      dateOfBirth: new Date('1990-01-15'),
      nationalId: '12345678901234',
      phone: '+213 XXX XXX XXX',
    });
    console.log('✅ Sample request created:');
    console.log(`   Request #: ${request.requestNumber}`);
    console.log(`   Status: ${request.status}\n`);

    // Create sample document
    const document = await Document.create({
      title: 'Birth Certificate - Ahmed Ali',
      description: 'Official birth certificate',
      status: 'pending',
      requestId: request.id,
      documentTypeId: documentTypes[0].id,
    });
    console.log('✅ Sample document created:');
    console.log(`   Title: ${document.title}`);
    console.log(`   Status: ${document.status}\n`);

    // Create sample task
    const task = await Task.create({
      title: 'Process Birth Certificate Request',
      description: 'Review and process the request for birth certificate',
      status: 'pending',
      priority: 'medium',
      requestId: request.id,
      createdByUserId: admin.id,
      assignedUserId: employee.id,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    console.log('✅ Sample task created:');
    console.log(`   Title: ${task.title}`);
    console.log(`   Assigned to: ${employee.firstName} ${employee.lastName}\n`);

    // Create sample notification
    const notification = await Notification.create({
      userId: citizen.id,
      title: 'Request Received',
      message: 'Your document request has been received and is being processed.',
      type: 'request',
      priority: 'medium',
      relatedEntityType: 'Request',
      relatedEntityId: request.id,
      actionUrl: `/requests/${request.id}`,
    });
    console.log('✅ Sample notification created:');
    console.log(`   Title: ${notification.title}\n`);

    console.log('🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

/**
 * Main execution
 */
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';

  switch (command) {
    case 'force':
      await syncDatabase({ force: true, alter: false });
      break;
    case 'seed':
      await syncDatabase();
      await seedDatabase();
      break;
    case 'sync':
    default:
      await syncDatabase();
  }

  // Close connection
  await sequelize.close();
  process.exit(0);
};

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
