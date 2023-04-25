const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const UserDeviceToken = db.define(
    "UserDeviceToken",
    {
      deviceToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "deviceToken"],
        },
      ],
    }
  );

  UserDeviceToken.belongsTo(db.Users, {
    as: "user",
    onDelete: "CASCADE",
    foriegnKey: {
      name: "userId",
      allowNull: false,
    },
  });

  return UserDeviceToken;
};
