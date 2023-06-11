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
          fields: ["studentId", "gameQuestionId"],
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

  GameAnswer.belongsTo(db.Games, {
    as: "game",
    onDelete: "CASCADE",
    foreignKey: {
      name: "gameId",
      allowNull: false,
    },
  });

  GameAnswer.belongsTo(db.GameQuestions, {
    as: "question",
    onDelete: "CASCADE",
    foreignKey: {
      name: "gameQuestionId",
      allowNull: false,
    },
  });
  return GameAnswer;
};
