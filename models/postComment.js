const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postComment', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    comment:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    postId:{
        type: DataTypes.UUID,
          allowNull: false,
          references: {
                    model: "post",
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
      }  
  }, {
    sequelize,
    tableName: 'postComment',
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
