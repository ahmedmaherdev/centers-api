// - Grades
//  - examId
//  - totalQuestions
//  - correct
//  - wrong
//  - isPassed
//  - studentId
// isPassed = (correct >= wrong )
const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Grade = db.define(
    "Grade",
    {
      total: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      correct: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wrong: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      isPassed: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {
        beforeSave: function (grade, options) {
          grade.isPassed = grade.correct >= grade.wrong;
        },
      },

      indexes: [
        {
          unique: true,
          fields: ["studentId", "examId"],
        },
      ],
    }
  );

  Grade.belongsTo(db.Users, {
    as: "student",
    onDelete: "CASCADE",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  Grade.belongsTo(db.Exams, {
    as: "exam",
    onDelete: "CASCADE",
    foreignKey: {
      name: "examId",
      allowNull: false,
    },
  });
  return Grade;
};
