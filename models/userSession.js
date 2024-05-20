const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userSession', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    device_type: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 1,
        comment: "1= ios, 2= android\t"
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    device_token: {
        type: DataTypes.STRING(255),
        allowNull: true
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
    }
   
  }, {
    sequelize,
    tableName: 'userSession',
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
