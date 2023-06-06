'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    Firstname: { type: DataTypes.STRING, validate: { notEmpty: true } },
    Lastname: { type: DataTypes.STRING, validate: { notEmpty: true } },
    Email: { type: DataTypes.STRING, validate: { isEmail: true } },
    ProfileImage: { type: DataTypes.STRING },
    Password: { type: DataTypes.STRING, validate: { len: [4, 20] } },
    Birthdate: { type: DataTypes.STRING, validate: { isDate: true } },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};