const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents users in the Moroccan Administrative Platform
 * Users can be citizens ("user") or municipality admins ("admin")
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique user identifier',
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'User first name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'User last name',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      comment: 'User email address (unique)',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [8, 255] },
      comment: 'Hashed password',
      set(value) {
        if (!value) return;
        // Only hash if it's not already hashed (for migrations/updates)
        if (!value.startsWith('$2')) {
          const salt = bcrypt.genSaltSync(10);
          this.setDataValue('password', bcrypt.hashSync(value, salt));
        } else {
          this.setDataValue('password', value);
        }
      },
    },
    role: {
      type: DataTypes.ENUM('citizen', 'employee', 'admin'),
      defaultValue: 'citizen',
      allowNull: false,
      comment: 'User role: citizen, employee, admin',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Department (for employees)',
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Position/title (for employees)',
    },
    nationalId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'National ID number (for citizens)',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User address',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Phone number',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Whether user account is active',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['nationalId'] },
      { fields: ['department'] },
    ],
  });

  // Instance methods
  User.prototype.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};