const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('adminQuestionOption', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
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
    options:{
        type:DataTypes.STRING(255),
        defaultValue:null,
        allowNull:true
    }
  }, {
    sequelize,
    tableName: 'adminQuestionOption',
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
