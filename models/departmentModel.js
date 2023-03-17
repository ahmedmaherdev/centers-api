const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const department = db.define(
    "Department",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["name", "schoolYearId"],
        },
      ],
    }
  );

  db.SchoolYears.hasOne(department, {
    as: "schoolYear",
    foreignKey: "schoolYearId",
  });

  department.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignKey: "schoolYearId",
  });

  return department;
};
