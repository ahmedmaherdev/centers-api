const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Game = db.define("Game", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questionsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    studentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    period: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startedAt: DataTypes.DATE,
    endedAt: DataTypes.DATE,
  });

  Game.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });

  Game.belongsTo(db.Departments, {
    as: "department",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });

  return Game;
};
