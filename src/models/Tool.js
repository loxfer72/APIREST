const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tool = sequelize.define(
  'Tool',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
        notEmpty: { msg: 'Name is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vendor: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Vendor is required' },
        len: { args: [1, 100], msg: 'Vendor must be at most 100 characters' },
      },
    },
    website_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: { msg: 'Must be a valid URL format' },
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monthly_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Must be a positive number' },
      },
    },
    active_users_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Must be a positive number' },
      },
    },
    owner_department: {
      type: DataTypes.ENUM(
        'Engineering',
        'Sales',
        'Marketing',
        'HR',
        'Finance',
        'Operations',
        'Design'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'deprecated', 'trial'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'tools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Tool;