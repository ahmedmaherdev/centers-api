const { DataTypes } = require("sequelize");

module.exports = (db) => {
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
          return this.getDataValue("choices")
            ? JSON.parse(this.getDataValue("choices"))
            : null;
        },
      },

      answer: {
        type: DataTypes.ENUM("A", "B", "C", "D"),
        allowNull: false,
      },
    },
    {
      hooks: {
        afterSave: async (question, options) => {
          const { examId } = question;
          const questionsCount = await Question.count({
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
        },
      },
    }
  );

  Question.belongsTo(db.Exams, {
    as: "exam",
    foreignKey: {
      name: "examId",
      allowNull: false,
    },
  });
  return Question;
};
