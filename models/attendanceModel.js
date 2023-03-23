const { DataTypes, fn, col } = require("sequelize");

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
        defaultValue: () => new Date(Date.now),
      },
    },
    {
      hooks: {
        afterSave: async function (attendance, options) {
          // const presence = await Attendance.count({
          //   where: {
          //     studentId: attendance.studentId,
          //     status: "presence",
          //   },
          // });

          // const absence = await Attendance.count({
          //   where: {
          //     studentId: attendance.studentId,
          //     sectionId: attendance.sectionId,
          //     status: "absence",
          //   },
          // });

          const data = Attendance.findAll({
            where: {
              studentId: attendance.studentId,
              sectionId: attendance.sectionId,
            },
            attributes: ["status", fn("count", col("status"), "count")],
            group: ["status"],
          });

          console.log(data);

          // change presence and absence to student
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
