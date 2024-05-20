const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('events', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    userId:{
      type: DataTypes.UUID,       
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    event_date: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    event_time: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    ticket_type: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    normal_ticket: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    sold_tickets: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    left_tickets: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    vip_ticket: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    vvip_ticket: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    no_of_tickets: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 0,
      comment: "1= user, 2=club"
    },
  }, {
    sequelize,
    tableName: 'events',
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
