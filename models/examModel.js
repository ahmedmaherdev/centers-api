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

      isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      defaultScope: {
        attributes: {
          exclude: ["subjectId", "createdById", "isOpen"],
        },
        include: [
          {
            as: "subject",
            model: db.Subjects,
          },
          {
            as: "createdBy",
            model: db.Users,
            // attributes: ["id", "name", "role", "photo"],
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
