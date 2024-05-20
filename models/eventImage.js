const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('eventImages', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    uploadedData: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      thumbnail:{
        type:DataTypes.STRING(200),
        allowNull:true
      },
      type:{
          type:DataTypes.STRING(10),  // 1 for image 2 for audio
          allowNull:true
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
      }
   
  }, {
    sequelize,
    tableName: 'eventImages',
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
