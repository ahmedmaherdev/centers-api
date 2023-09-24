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
        include: [
          {
            as: "department",
            model: db.Departments,
          },
        ],
      },
    }
  );

  Exam.belongsTo(db.Departments, {
    as: "department",
    foreignKey: {
      name: "departmentId",
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
