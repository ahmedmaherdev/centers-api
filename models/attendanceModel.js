const { DataTypes, fn, col } = require("sequelize");
const moment = require("moment");
const { maxAllowedAbsence } = require("../config");

module.exports = (db) => {
  const Attendance = db.define(
    "Attendance",
    {
      status: {
        type: DataTypes.ENUM("presence", "absence"),
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        defaultValue: () => moment(Date.now()).format("YYYY-MM-DD"),
      },
    },
    {
      hooks: {
        afterSave: async function (attendance, options) {
          const presence = await Attendance.count({
            where: {
              studentId: attendance.studentId,
              status: "presence",
            },
          });

          const absence = await Attendance.count({
            where: {
              studentId: attendance.studentId,
              status: "absence",
            },
          });

          if (absence >= maxAllowedAbsence) user.isSuspended = true;
          user = await db.Users.findByPk(attendance.studentId);

          user.student.presence = presence;
          user.student.absence = absence;

          await user.save();
          await user.student.save();
        },

        afterBulkCreate: async function (attendances, options) {
          for (let attendance of attendances) {
            const presence = await Attendance.count({
              where: {
                studentId: attendance.studentId,
                status: "presence",
              },
            });

            const absence = await Attendance.count({
              where: {
                studentId: attendance.studentId,
                status: "absence",
              },
            });

            if (absence >= maxAllowedAbsence) user.isSuspended = true;
            user = await db.Users.findByPk(attendance.studentId);

            user.student.presence = presence;
            user.student.absence = absence;

            await user.save();
            await user.student.save();
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["studentId", "sectionId", "date"],
        },
      ],
      defaultScope: {
        include: [
          {
            as: "student",
            model: db.Users,
          },
        ],
      },
    }
  );

  Attendance.belongsTo(db.Users, {
    as: "student",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  Attendance.belongsTo(db.Sections, {
    as: "section",
    foreignKey: {
      name: "sectionId",
      allowNull: false,
    },
  });

  Attendance.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });
  return Attendance;
};
