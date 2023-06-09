const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const GameStudent = db.define(
    "GameStudent",
    {},
    {
      indexes: [
        {
          unique: true,
          fields: ["studentId", "gameId"],
        },
      ],
    }
  );

  GameStudent.belongsTo(db.Users, {
    as: "student",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  GameStudent.belongsTo(db.Departments, {
    as: "game",
    foreignKey: {
      name: "gameId",
      allowNull: false,
    },
  });

  return GameStudent;
};
