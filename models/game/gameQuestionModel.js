const { DataTypes, fn, col } = require("sequelize");

module.exports = (db) => {
  const calcGameQuestions = async (gameQuestion, GameQuestion) => {
    const { gameId } = gameQuestion;
    const gameQuestionsCount = await GameQuestion.count({
      distinct: true,
      col: `${GameQuestion.name}.id`,
      where: { gameId },
    });

    const gameQuestionsPeriod = await GameQuestion.findOne({
      where: {
        gameId,
      },

      attributes: [[fn("SUM", col("period")), "totalPeriod"]],
    });

    await db.Games.update(
      {
        questionsCount: gameQuestionsCount,
        period: gameQuestionsPeriod.dataValues?.totalPeriod ?? 0,
      },
      {
        where: { id: gameId },
      }
    );
  };
  const GameQuestion = db.define(
    "GameQuestion",
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      choices: {
        type: DataTypes.JSON,
        allowNull: false,

        get() {
          let choices = this.getDataValue("choices");
          return typeof choices === "string" ? JSON.parse(choices) : choices;
        },
      },

      answer: {
        type: DataTypes.ENUM("A", "B", "C", "D"),
        allowNull: false,
      },

      // period: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 30, // default value 30 seconds
      // },

      // sendedAt: {
      //   type: DataTypes.DATE,
      // },
    },
    {
      defaultScope: {
        include: [
          {
            as: "subject",
            model: db.Subjects,
            attributes: ["id", "name"],
            include: {
              as: "departments",
              model: db.Departments,
              attributes: [],
            },
          },
        ],
      },
      hooks: {
        afterSave: async (gameQuestion, options) => {
          await calcGameQuestions(gameQuestion, GameQuestion);
        },

        afterDestroy: async function (gameQuestion, options) {
          await calcGameQuestions(gameQuestion, GameQuestion);
        },
      },
    }
  );

  GameQuestion.belongsTo(db.Subjects, {
    as: "subject",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  GameQuestion.belongsTo(db.Games, {
    as: "game",
    onDelete: "CASCADE",
    foreignKey: {
      name: "gameId",
      allowNull: false,
    },
  });

  return GameQuestion;
};
