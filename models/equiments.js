'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Equiments extends Model {
    static associate(models) {
      Equiments.belongsTo(models.Locations, { foreignKey: 'id', targetKey: 'id' });
    }
  }
  Equiments.init({
    equiment_name: DataTypes.STRING,
    location_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    buget_year: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Equiments',
    underscored: true,
    underscoreAll: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
  return Equiments;
};