const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Exam = db.define(
    "Exam",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      photo: {
        type: DataTypes.STRING,
        defaultValue: "examPhotos/default_dhg5wg.jpg",
      },

      period: {
        type: DataTypes.INTEGER,
        allowNullL: false,
      },

      questionsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      defaultScope: {
        attributes: {
          exclude: ["subjectId", "createdById"],
        },
        include: [
          {
            as: "subject",
            model: db.Subjects,
          },
          {
            as: "createdBy",
            model: db.Users,
          },
        ],
      },
    }
  );

  Exam.belongsTo(db.Subjects, {
    as: "subject",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  Exam.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });

  return Exam;
};
