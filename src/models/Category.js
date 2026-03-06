const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color_hex: {
      type: DataTypes.STRING(7),
      defaultValue: '#6366f1',
    },
  },
  {
    tableName: 'categories',
    timestamps: true,        // mappe created_at
    updatedAt: false,        // la table n'a pas de updated_at
    createdAt: 'created_at',
  }
);

module.exports = Category;