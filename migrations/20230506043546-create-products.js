'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pro_id: {
        type: Sequelize.STRING
      },
      pro_name: {
        type: Sequelize.STRING
      },
      pro_cost_price: {
        type: Sequelize.STRING
      },
      pro_price: {
        type: Sequelize.STRING
      },
      pro_qty: {
        type: Sequelize.STRING
      },
      type_id: {
        type: Sequelize.STRING
      },
      pro_status: {
        type: Sequelize.STRING
      },
      pro_date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};