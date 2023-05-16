const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Room = db.define(
    "Room",
    {},
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

  Room.belongsTo(db.Messages, {
    as: "message",
    foreignKey: {
      name: "messsageId",
      allowNull: false,
    },
  });

  return Room;
};
