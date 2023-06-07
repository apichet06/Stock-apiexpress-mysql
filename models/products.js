'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init({
    pro_id: DataTypes.STRING,
    pro_name: DataTypes.STRING,
    pro_cost_price: DataTypes.DECIMAL(5, 2),
    pro_price: DataTypes.DECIMAL(5, 2),
    pro_qty: DataTypes.INTEGER,
    type_id: DataTypes.STRING,
    pro_status: DataTypes.STRING,
    pro_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Products',
  });
  return Products;
};