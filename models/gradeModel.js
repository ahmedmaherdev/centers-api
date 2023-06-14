const { DataTypes, fn, col } = require("sequelize");

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
      defaultScope: {
        include: [
          {
            model: db.Exams,
            as: "exam",
            attributes: ["id", "name", "photo", "questionsCount"],
          },
        ],
      },
      hooks: {
        beforeSave: function (grade, options) {
          grade.isPassed = grade.correct >= grade.wrong;
        },

        afterSave: async function (grade, options) {
          const studentData = await db.Users.findByPk(grade.studentId);
          const totalExams = await Grade.count({
            where: {
              studentId: studentData.id,
            },
          });

          const passExams = await Grade.count({
            where: { isPassed: true, studentId: studentData.id },
          });

          const studentPoints = await Grade.findOne({
            where: {
              studentId: studentData.id,
            },

            include: {
              model: db.Exams,
              as: "exam",
              attributes: [],
              include: {
                model: db.Departments,
                as: "department",
                attributes: [],
              },
            },

            attributes: [[fn("sum", col("correct")), "totalCorrect"]],
            raw: true,
          });

          const points = studentPoints.totalCorrect ?? 0;
          studentData.student.allExams = totalExams;
          studentData.student.passExams = passExams;
          studentData.student.points = points;
          await studentData.student.save();
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
