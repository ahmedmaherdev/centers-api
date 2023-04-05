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
    onDelete: "CASCADE",
    foreignKey: {
      name: "subjectId",
      allowNull: false,
    },
  });

  db.Departments.belongsToMany(db.Subjects, {
    through: SubjectDepartment,
    as: "subjects",
    onDelete: "CASCADE",
    foreignKey: {
      name: "departmentId",
      allowNull: false,
    },
  });

  return SubjectDepartment;
};
