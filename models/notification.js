const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notification', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    senderId:{
        type: DataTypes.UUID,
          allowNull: false,
          references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
      },
    receiverId:{
        type: DataTypes.UUID,
          allowNull: false,
          references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
      },
    message:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    requestType:{
        type:DataTypes.INTEGER(10),
        defaultValue:0//1 means friend requrest other means normal
    },
    userFollowId:{
      type:DataTypes.STRING(255),
      defaultValue:0
    }    
  }, {
    sequelize,
    tableName: 'notification',
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
