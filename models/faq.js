const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('faq', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    question:{
        type:DataTypes.STRING(255),
        defaultValue:null,
        allowNull:true
    },
    answer:{
        type:DataTypes.STRING(255),
        defaultValue:null,
        allowNull:true
    }
  }, {
    sequelize,
    tableName: 'faq',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};