const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const post = sequelize.define('post', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "user"
    },
    media: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    media_type: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: 0,
      comment: "0=photos, 1=videos"
    },
    clubId:{
      type: DataTypes.UUID,
      allowNull: true,
      references: {
                model: "club",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
    },
    name_of_the_club: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    caption:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'post',
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

  post.associate = models => {
		post.belongsTo(models.users, { foreignKey: 'user_id', hooks: true });


	};

  return post;
};
