const { DataTypes } = require("sequelize");
const { subscribedTill } = require("../config");

module.exports = (db) => {
  const Subscribe = db.define(
    "Subscribe",
    {},
    {
      defaultScope: {
        include: [
          {
            as: "student",
            model: db.Users,
            attributes: ["id", "name", "photo", "role"],
          },
          {
            as: "createdBy",
            model: db.Users,
            attributes: ["id", "name", "photo", "role"],
          },
        ],
      },
      hooks: {
        afterSave: async function (subscribe, options) {
          const studentData = await db.Users.findByPk(subscribe.studentId);
          let newSubscribedTill =
            new Date(studentData.student.subscribedTill).getTime() +
            subscribedTill; // last student subscribedTill + 30 days

          studentData.student.subscribedTill = new Date(newSubscribedTill);
          await studentData.student.save();
        },
      },
    }
  );

  Subscribe.belongsTo(db.Users, {
    as: "student",
    onDelete: "CASCADE",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  Subscribe.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });

  return Subscribe;
};
