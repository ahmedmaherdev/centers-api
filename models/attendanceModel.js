const { DataTypes, fn, col } = require("sequelize");
const moment = require("moment");
const config = require("../config");

module.exports = (db) => {
  const calcStudentAttendances = async function (Attendance, attendance) {
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

    const user = await db.Users.findByPk(attendance.studentId);

    if (absence >= user.student.maxAllowedAbsence) user.isSuspended = true;

    user.student.presence = presence;
    user.student.absence = absence;

    await user.save();
    await user.student.save();
  };

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
          await calcStudentAttendances(Attendance, attendance);
        },

        afterBulkCreate: async function (attendances, options) {
          for (let attendance of attendances) {
            await calcStudentAttendances(Attendance, attendance);
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
            attributes: ["id", "name", "photo", "role"],
            include: {
              as: "student",
              model: db.Students,
              attributes: [],
            },
          },
        ],
      },
    }
  );

  Attendance.belongsTo(db.Users, {
    as: "student",
    onDelete: "CASCADE",
    foreignKey: {
      name: "studentId",
      allowNull: false,
    },
  });

  Attendance.belongsTo(db.Sections, {
    as: "section",
    onDelete: "CASCADE",
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
