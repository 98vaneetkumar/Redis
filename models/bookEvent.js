const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookEvent', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    eventId:{
        type: DataTypes.UUID,	
        allowNull: false,
        references: {
                  model: "events",
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
    ticketType:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    noOfTickets:{
        type:DataTypes.INTEGER(100),
        allowNull:true
    },
   
  }, {
    sequelize,
    tableName: 'bookEvent',
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
