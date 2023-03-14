const { DataTypes } = require("sequelize");
const { isMobilePhone } = require("validator");

module.exports = (db) => {
  const SchoolYear = require("./schoolYearModel")(db);
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
      code: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        include: [{ model: SchoolYear, as: "schoolYear" }],
        attributes: {
          exclude: ["schoolYearId", "code"],
        },
      },
    }
  );

  SchoolYear.hasOne(Student, {
    as: "schoolYear",
    foreignkey: "schoolYearId",
  });
  Student.belongsTo(SchoolYear, {
    as: "schoolYear",
    foreignkey: "schoolYearId",
  });

  return Student;
};
