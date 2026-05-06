const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Link = sequelize.define(
  'Link',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    original_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    short_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    click_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'links',
    indexes: [
      { unique: true, fields: ['short_code'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = Link;
