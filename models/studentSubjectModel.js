const { DataTypes, Op } = require("sequelize");

module.exports = (db) => {
  const StudentSubject = db.define(
    "StudentSubject",
    {
      sections: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      hooks: {
        afterBulkCreate: async function (studentSubjects, options) {
          // let subjects = studentSubjects.map((s) => s.subjectId);
          const sections = await db.StudentSubjects.sum("sections", {
            where: {
              studentId: studentSubjects[0].studentId,
            },
          });

          const user = await db.Users.findByPk(studentSubjects[0].studentId);
          const student = await db.Students.findByPk(user.studentId);
          student.allPresence = sections;
          await student.save();
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["studentId", "subjectId"],
        },
      ],
    }
  );

  StudentSubject.belongsTo(db.Users, {
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  StudentSubject.belongsTo(db.Subjects, {
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  return StudentSubject;
};
