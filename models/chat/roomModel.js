const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Room = db.define(
    "Room",
    {
      lastMessage: {
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["studentId"],
        },
      ],
    }
  );

  Room.belongsTo(db.Users, {
    as: "student",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  return Room;
};
