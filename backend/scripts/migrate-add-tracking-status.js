/**
 * Migration Script: Add Tracking Status to Requests Table
 * 
 * IMPORTANT: Run this BEFORE starting the application
 * This adds the trackingStatus column to track request location/status
 */

const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add trackingStatus to requests table...');

    // Check if column already exists
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable('requests');

    if (table.trackingStatus) {
      console.log('✅ Column trackingStatus already exists. Skipping migration.');
      return;
    }

    // Add the column
    await queryInterface.addColumn('requests', 'trackingStatus', {
      type: DataTypes.ENUM('submitted', 'in_processing', 'under_validation', 'validated', 'ready_for_pickup', 'rejected'),
      defaultValue: 'submitted',
      allowNull: false,
      comment: 'Current tracking/location step of the request',
    });

    console.log('✅ Migration completed successfully!');
    console.log('✓ Added column: trackingStatus');
    console.log('✓ Default value: submitted');
    console.log('✓ Possible values: submitted, in_processing, under_validation, validated, ready_for_pickup, rejected');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

module.exports = { runMigration };
