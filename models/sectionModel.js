const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Section = db.define(
    "Section",
    {
      day: {
        type: DataTypes.ENUM(
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday"
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
          { as: "teacher", model: db.Teachers },
        ],

        attributes: {
          exclude: ["subjectId", "teacherId"],
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

  Section.belongsTo(db.Teachers, {
    as: "teacher",
    foreignKey: {
      name: "teacherId",
      allowNull: false,
    },
  });
  return Section;
};
