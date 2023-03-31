const { DataTypes } = require("sequelize");
const { isMobilePhone } = require("validator");
const { maxAllowedAbsence } = require("../config");

module.exports = (db) => {
  const Student = db.define(
    "Student",
    {
      gender: DataTypes.ENUM("male", "female"),
      parentPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          customValidator(value) {
            if (!isMobilePhone(value, "ar-EG"))
              return new Error("Invalid phone number.");
          },
        },
      },
      subscriptedTill: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      },
      presence: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      allPresence: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      absence: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      maxAllowedAbsence: {
        type: DataTypes.INTEGER,
        defaultValue: maxAllowedAbsence,
      },
      lastAbsence: DataTypes.DATEONLY,

      allExams: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      passExams: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      code: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        include: [
          { model: db.SchoolYears, as: "schoolYear" },
          { model: db.Departments, as: "department" },
        ],
        attributes: {
          exclude: ["schoolYearId", "departmentId", "code", "lastAbsence"],
        },
      },
    }
  );

  Student.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignkey: { name: "schoolYearId", allowNull: false },
  });

  Student.belongsTo(db.Departments, {
    as: "department",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });
  return Student;
};
