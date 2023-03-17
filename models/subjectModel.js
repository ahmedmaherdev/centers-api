const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const subject = db.define(
    "Subject",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      sections: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["departmentId", "name"],
        },
      ],
      defaultScope: {
        include: [
          {
            model: db.Departments,
            as: "department",
          },
        ],

        attributes: {
          exclude: ["departmentId"],
        },
      },
    }
  );

  subject.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignKey: {
      name: "schoolYearId",
      allowNull: false,
    },
  });

  subject.belongsTo(db.Departments, {
    as: "department",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });

  return subject;
};
