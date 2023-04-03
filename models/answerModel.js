const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Answer = db.define(
    "Answer",
    {
      answer: {
        type: DataTypes.ENUM("A", "B", "C", "D"),
        allowNull: false,
      },
    },
    {
      defaultScope: {
        include: [
          {
            model: db.Questions,
            as: "question",
          },
        ],
      },
      indexes: [
        {
          unique: true,
          fields: ["studentId", "questionId"],
        },
      ],
    }
  );

  Answer.belongsTo(db.Users, {
    as: "student",
    onDelete: "CASCADE",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  Answer.belongsTo(db.Exams, {
    as: "exam",
    onDelete: "CASCADE",
    foreignKey: {
      name: "examId",
      allowNull: false,
    },
  });

  Answer.belongsTo(db.Questions, {
    as: "question",
    onDelete: "CASCADE",
    foreignKey: {
      name: "questionId",
      allowNull: false,
    },
  });
  return Answer;
};
