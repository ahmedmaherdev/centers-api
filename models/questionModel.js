const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const calcExamQuestions = async (question, Question) => {
    const { examId } = question;
    const questionsCount = await Question.count({
      distinct: true,
      col: `${Question.name}.id`,
      where: { examId },
    });

    await db.Exams.update(
      {
        questionsCount,
      },
      {
        where: { id: examId },
      }
    );
  };
  const Question = db.define(
    "Question",
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
    },
    {
      defaultScope: {
        include: [
          {
            as: "subject",
            model: db.Subjects,
            attributes: ["id", "name"],
          },
        ],
      },
      hooks: {
        afterSave: async (question, options) => {
          await calcExamQuestions(question, Question);
        },

        afterDestroy: async function (question, options) {
          await calcExamQuestions(question, Question);
        },
      },
    }
  );

  Question.belongsTo(db.Subjects, {
    as: "subject",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  Question.belongsTo(db.Exams, {
    as: "exam",
    onDelete: "CASCADE",
    foreignKey: {
      name: "examId",
      allowNull: false,
    },
  });
  return Question;
};
