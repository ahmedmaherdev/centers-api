const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Note = db.define(
    "Note",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      defaultScope: {
        include: [
          {
            as: "schoolYear",
            model: db.SchoolYears,
          },
        ],
      },
    }
  );

  Note.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignKey: {
      name: "schoolYearId",
      allowNull: false,
    },
  });

  return Note;
};
