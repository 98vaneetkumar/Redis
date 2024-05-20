const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reports', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    reported_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reported_to: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  
  }, {
    sequelize,
    tableName: 'reports',
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
