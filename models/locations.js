'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Locations extends Model {
    static associate(models) {
      // Locations.hasMany(models.Equiments, { foreignKey: 'location_id' });
    }
  }
  Locations.init({
    location_name: DataTypes.STRING,
    branch_info: DataTypes.STRING,
    room_number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Locations',
    underscored: true,
    underscoreAll: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
  return Locations;
};