const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const GameMatch = db.define(
    "GameMatch",
    {
      round: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["gameId", "round", "student1Id"],
        },
        {
          unique: true,
          fields: ["gameId", "round", "student2Id"],
        },
      ],
    }
  );
  GameMatch.belongsTo(db.Games, {
    as: "game",
    onDelete: "CASCADE",
    foreignKey: {
      name: "gameId",
      allowNull: false,
    },
  });
  GameMatch.belongsTo(db.Users, {
    as: "student1",
    foreignKey: {
      name: "student1Id",
      allowNull: false,
    },
  });

  GameMatch.belongsTo(db.Users, {
    as: "student2",
    foreignKey: {
      name: "student2Id",
      allowNull: false,
    },
  });

  GameMatch.belongsTo(db.GameQuestions, {
    as: "question",
    foreignKey: {
      name: "gameQuestionId",
      allowNull: false,
    },
  });
  return GameMatch;
};
