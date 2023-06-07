'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Picture_Pro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Picture_Pro.init({
    pro_id: DataTypes.STRING,
    pic_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Picture_Pro',
  });
  return Picture_Pro;
};