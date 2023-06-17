const { DataTypes, Op } = require("sequelize");

module.exports = (db) => {
  const Advertisement = db.define(
    "Advertisement",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pirority: {
        type: DataTypes.ENUM("important", "unimportant"),
        defaultValue: "unimportent",
      },
      startedAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(Date.now()),
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiredAt: {
        type: DataTypes.DATE,
      },
    },
    {
      hooks: {
        beforeSave: function (advertisement, options) {
          advertisement.expiredAt = advertisement.endedAt;
        },
      },
      defaultScope: {
        where: {
          expiredAt: {
            [Op.gte]: new Date(Date.now()),
          },
        },
        include: [
          {
            as: "schoolYear",
            model: db.SchoolYears,
          },
        ],
      },
    }
  );

  Advertisement.belongsTo(db.SchoolYears, {
    as: "schoolYear",
    foreignKey: {
      name: "schoolYearId",
      allowNull: false,
    },
  });

  return Advertisement;
};
