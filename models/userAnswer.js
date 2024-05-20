const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userAnswer', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    userId:{
        type: DataTypes.UUID,	
        allowNull: false,
        references: {
                  model: "users",
                  key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
      },
    questionId:{
      type: DataTypes.UUID,	
      allowNull: false,
      references: {
                model: "adminQuestion",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
    },
    answerId:{
        type: DataTypes.UUID,	
        allowNull: false,
        references: {
                  model: "adminQuestionOption",
                  key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
      }
  }, {
    sequelize,
    tableName: 'userAnswer',
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
