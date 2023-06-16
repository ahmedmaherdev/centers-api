const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const GameAnswer = db.define(
    "GameAnswer",
    {
      answer: {
        type: DataTypes.ENUM("A", "B", "C", "D"),
      },

      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["studentId", "gameMatchId"],
        },
      ],
    }
  );

  GameAnswer.belongsTo(db.Users, {
    as: "student",
    onDelete: "CASCADE",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  GameAnswer.belongsTo(db.GameMatches, {
    as: "match",
    foreignKey: {
      name: "gameMatchId",
      allowNull: false,
    },
  });
  return GameAnswer;
};
