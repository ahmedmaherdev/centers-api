const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Section = db.define(
    "Section",
    {
      day: {
        type: DataTypes.ENUM(
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ),
      },
      time: {
        type: DataTypes.TIME,
      },
    },
    {
      defaultScope: {
        include: [
          { as: "subject", model: db.Subjects },
          { as: "department", model: db.Departments },
          { as: "teacher", model: db.Teachers },
        ],

        attributes: {
          exclude: ["departmentId", "subjectId", "teacherId"],
        },
      },
    }
  );

  Section.belongsTo(db.Subjects, {
    as: "subject",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  Section.belongsTo(db.Departments, {
    as: "department",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });

  Section.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignKey: {
      name: "schoolYearId",
      allowNull: false,
    },
  });

  Section.belongsTo(db.Teachers, {
    as: "teacher",
    foreignKey: {
      name: "teacherId",
      allowNull: false,
    },
  });
  return Section;
};
