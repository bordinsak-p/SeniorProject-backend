'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Repairs extends Model {
    static associate(models) {
      Repairs.belongsTo(models.Users, { foreignKey: 'user_id', as: 'users' });
      Repairs.belongsTo(models.Equipments, { foreignKey: 'equipmentpk_id', as: 'equipments' });
    }
  }
  Repairs.init({
    user_id: DataTypes.INTEGER,
    equipmentpk_id: DataTypes.INTEGER,
    request_date: DataTypes.DATE,
    image: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Repairs',
    underscored: true,
    underscoreAll: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
  return Repairs;
};