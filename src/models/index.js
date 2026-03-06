const Tool = require('./Tool');
const Category = require('./Category');
const UsageLog = require('./UsageLog');

// Associations
// Tool appartient à une Category → ajoute category_id comme FK
Tool.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Une Category peut avoir plusieurs Tools
Category.hasMany(Tool, {
  foreignKey: 'category_id',
  as: 'tools',
});

// Un Tool a plusieurs UsageLogs
Tool.hasMany(UsageLog, {
  foreignKey: 'tool_id',
  as: 'usage_logs',
});

module.exports = { Tool, Category, UsageLog };