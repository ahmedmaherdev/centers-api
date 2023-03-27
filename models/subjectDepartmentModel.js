module.exports = (db) => {
  const SubjectDepartment = db.define(
    "SubjectDepartment",
    {},
    {
      indexes: [
        {
          unique: true,
          fields: ["subjectId", "departmentId"],
        },
      ],
    }
  );

  db.Subjects.belongsToMany(db.Departments, {
    through: SubjectDepartment,
    as: "departments",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  db.Departments.belongsToMany(db.Subjects, {
    through: SubjectDepartment,
    as: "subjects",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });

  return SubjectDepartment;
};
