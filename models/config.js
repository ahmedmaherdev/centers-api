module.exports = {
  host: "localhost",
  user: "centers_user",
  password: "123456789",
  database: "Centers_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
