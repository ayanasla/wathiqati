// dotenv already loaded in server.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Database Configuration
 * Supports MySQL, PostgreSQL, SQLite, and MSSQL
 * Database dialect is controlled by DB_DIALECT env variable
 */

const dbConfig = {
  database: process.env.DB_NAME || 'wathiqati_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  timezone: process.env.DB_TIMEZONE || '+00:00',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// SQLite specific configuration (for development/testing)
if (process.env.DB_DIALECT === 'sqlite') {
  dbConfig.storage = process.env.DB_STORAGE || './database.sqlite';
  delete dbConfig.username;
  delete dbConfig.password;
  delete dbConfig.host;
  delete dbConfig.port;
  delete dbConfig.dialectOptions;
}

// PostgreSQL specific configuration
if (process.env.DB_DIALECT === 'postgres') {
  dbConfig.port = process.env.DB_PORT || 5432;
  dbConfig.dialectOptions = {
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

// Create Sequelize instance based on dialect
let sequelize;

if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      timezone: dbConfig.timezone,
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions,
      pool: dbConfig.pool,
    }
  );
}

/**
 * Test Database Connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
