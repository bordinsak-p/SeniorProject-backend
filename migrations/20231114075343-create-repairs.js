'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Repairs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      equipmentpk_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Equipments",
          key: "id",
          onDelete: 'CASCADE', // หรือ 'SET NULL' หรือ 'NO ACTION'
          onUpdate: 'CASCADE', // หรือ 'SET NULL' หรือ 'NO ACTION'
        },
      },
      image: {
        type: Sequelize.STRING
      },
      request_date: {
        type: Sequelize.DATE
      },
      description: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Repairs');
  }
};