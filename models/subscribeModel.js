const { DataTypes } = require("sequelize");
const config = require("../config");
const moment = require("moment");

module.exports = (db) => {
  const Subscribe = db.define(
    "Subscribe",
    {
      subscribedTill: {
        type: DataTypes.DATE,
      },
    },
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
        beforeSave: async function (subscribe, options) {
          const studentData = await db.Users.findByPk(subscribe.studentId);

          let newSubscribedTill = moment(
            studentData.student?.subscribedTill ?? Date.now()
          ).add(config.subscribedTill, "days");

          subscribe.subscribedTill = newSubscribedTill;
          // pass student object to after save hook
          options.studentData = studentData;
        },

        afterSave: async function (subscribe, options) {
          if (options.studentData && options.studentData.student) {
            options.studentData.student.subscribedTill =
              subscribe.subscribedTill;
            await options.studentData.student.save();
          }
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
