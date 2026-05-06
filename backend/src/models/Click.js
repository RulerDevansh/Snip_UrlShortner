const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Click = sequelize.define(
  'Click',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    link_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45), // IPv6-safe length
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    referrer: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  },
  {
    tableName: 'clicks',
    updatedAt: false, // clicks are immutable
    indexes: [{ fields: ['link_id'] }],
  }
);

module.exports = Click;
