const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reviewsRating', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    clubId:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
                  model: "club",
                  key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "CASCADE",
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
    rating:{
        type:DataTypes.ENUM('1','2','3','4','5'),
        allowNull:true
    },
    message:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
   
  }, {
    sequelize,
    tableName: 'reviewsRating',
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
