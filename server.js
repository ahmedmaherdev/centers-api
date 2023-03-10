const app = require("./app");
const dotenv = require("dotenv");
const { cloudinaryConfig } = require("./utils/cloudinary");
const db = require("./models");
dotenv.config();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!!");
  console.log(err.name, err.message);
  process.exit(1);
});

// db
db.sync()
  .then(() => console.log("Database is connected successfully."))
  .catch((err) => console.error(err));
cloudinaryConfig();

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () =>
  console.log(`Server is listening on port: ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION !!!!!!!!");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED, Shutting down gracefully");
  server.close(() => {
    console.log("Process Terminated");
  });
});
