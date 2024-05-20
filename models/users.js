const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('0','1','2'),
      allowNull: true,
      defaultValue: "1",
      comment: "0=admin, 1=user 2=club"
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1=user, 2=club"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    socialId:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    socialType:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bio:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(100),
      allowNull: true
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
    admin_commission: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    age: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('0','1'),
      allowNull: true,
      defaultValue: "1",
      comment: "0=inactive, 1=active"
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    is_otp_verified: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "0 for no, 1 for yes"
    },
    device_type: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
      comment: "1= ios, 2= android\t"
    },
    device_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notification_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "\t1 for yes, 0 for no"
    },
    wallet: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
    },
    login_time: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
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
