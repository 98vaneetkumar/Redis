const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userFollow', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    follwer:{ // kon ker rha he 
        type: DataTypes.UUID,
          allowNull: false,
          references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
      },
      followingId:{ //or kis ko kiya he
        type: DataTypes.UUID,
          allowNull: false,
          references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
      },
     isAccept:{
      type:DataTypes.INTEGER(10),
      defaultValue:0//1 means accept 2 means reject
     }   
  }, {
    sequelize,
    tableName: 'userFollow',
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
