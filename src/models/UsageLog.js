const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UsageLog = sequelize.define(
  'UsageLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tool_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    usage_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    actions_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'usage_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
  }
);

module.exports = UsageLog;