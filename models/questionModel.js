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
    onDelete: "CASCADE",
    foreignKey: {
      name: "examId",
      allowNull: false,
    },
  });
  return Question;
};
