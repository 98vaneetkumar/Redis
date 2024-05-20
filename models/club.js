const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const club = sequelize.define('club', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    club_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    is_approved: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    enterprise_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Id_number: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    latitude: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    longitude: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "0=inactive, 1=active"
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "0=not delete, 1=deleted"
    }
  }, {
    sequelize,
    tableName: 'club',
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

  club.associate = models => {
		club.belongsTo(models.users, { foreignKey: 'user_id', hooks: false });
    




	};

  return club;
};
