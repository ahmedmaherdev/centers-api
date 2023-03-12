const { DataTypes } = require("sequelize");
const { isMobilePhone } = require("validator");

module.exports = (db) => {
  const SchoolYear = require("./schoolYearModel")(db);
  const Student = db.define(
    "Student",
    {
      classroom: DataTypes.ENUM("first", "second"),
      gender: DataTypes.ENUM("male", "female"),
      fatherPhone: {
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
        include: [SchoolYear],
        attributes: {
          exclude: ["SchoolYearId"],
        },
      },
    }
  );

  SchoolYear.hasOne(Student);
  Student.belongsTo(SchoolYear);

  return Student;
};
