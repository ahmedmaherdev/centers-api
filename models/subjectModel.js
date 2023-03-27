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
          fields: ["name", "schoolYearId"],
        },
      ],
      defaultScope: {
        include: [
          {
            model: db.Departments,
            as: "departments",
            through: {
              attributes: [],
            },
          },
        ],
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

  return subject;
};
