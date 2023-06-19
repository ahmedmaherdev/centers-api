const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const calcGameStudents = async (gameStudent, GameStudent) => {
    const studentsCount = await GameStudent.count({
      where: {
        gameId: gameStudent.gameId,
      },
    });
    await db.Games.update(
      {
        studentsCount,
      },
      {
        where: { id: gameStudent.gameId },
      }
    );
  };

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

      hooks: {
        afterCreate: async function (gameStudent, options) {
          calcGameStudents(gameStudent, GameStudent);
        },
        afterBulkDestroy: async function (options) {
          await calcGameStudents(options.where, GameStudent);
        },
      },
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
