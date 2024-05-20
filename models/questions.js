const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('questions', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
   
  }, {
    sequelize,
    tableName: 'questions',
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
