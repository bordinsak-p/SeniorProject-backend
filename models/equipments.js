'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Equipments extends Model {
    static associate(models) {
      Equipments.belongsTo(models.Locations, { foreignKey: 'id', targetKey: 'id' });
    }
  }
  Equipments.init({
    equipment_id: DataTypes.STRING,
    equipment_name: DataTypes.STRING,
    location_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    buget_year: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Equipments',
    underscored: true,
    underscoreAll: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
  return Equipments;
};