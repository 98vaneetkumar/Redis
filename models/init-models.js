var DataTypes = require("sequelize").DataTypes;
var _post = require("./post");

function initModels(sequelize) {
  var post = _post(sequelize, DataTypes);


  return {
    post,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
