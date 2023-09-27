const users = require("./data/users.json");
const centers = require("./data/centers.json");
const departments = require("./data/departments.json");
const schoolYears = require("./data/schoolYears.json");
const subjects = require("./data/subjects.json");
const subjectDepartments = require("./data/subjectDepartments.json");

const db = require("./models");

// db
db.sync({})
  .then(async () => {
    console.log("Database is connected successfully.");
    await runScript();
  })
  .catch((err) => console.error(err));

async function runScript() {
  try {
    // console.log(await getAllTableNames());
    await deleteAllTables();
    await resetAutoIncrement();
    await createDefaultData();
  } catch (error) {
    console.log(error);
  } finally {
    db.close();
  }
}
async function getAllTableNames() {
  const [results, metadata] = await db.query("SHOW TABLES");
  return results.map((row) => row.Tables_in_centers_db);
}

async function resetAutoIncrement() {
  const tableNames = await getAllTableNames();
  for (const tableName of tableNames) {
    await db.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
  }

  console.log("Reset auto increment created successfully....");
}

async function deleteAllTables() {
  const Models = [
    db.SchoolYears,
    db.Departments,
    db.Students,
    db.Users,
    db.Subjects,
    db.Teachers,
    db.Sections,
    db.StudentSubjects,
    db.SubjectDepartments,
    db.Exams,
    db.Subscribes,
    db.Centers,
    db.Advertisements,
    db.Notes,
    db.Games,
  ];

  for (let i = Models.length - 1; i >= 0; i--) {
    await Models[i].destroy({
      where: {},
    });
  }
  console.log("Data deleted successfully....");
}

async function createDefaultData() {
  await db.Users.create(users[0]);
  await db.Centers.bulkCreate(centers);
  await db.SchoolYears.bulkCreate(schoolYears);
  await db.Departments.bulkCreate(departments);
  await db.Subjects.bulkCreate(subjects);
  await db.SubjectDepartments.bulkCreate(subjectDepartments);

  console.log("Data created successfully....");
}
