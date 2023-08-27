const app = require("./app");
const dotenv = require("dotenv");
const { cloudinaryConfig } = require("./utils/cloudinary");
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: "*",
});
const db = require("./models");
const onConnection = require("./controllers/socketIOController/onConnection")(
  io
);
const protectSocketMiddlware = require("./middlewares/protectSocketMiddleware")(
  io
);

dotenv.config();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!!");
  console.log(err.name, err.message);
  process.exit(1);
});

// db
db.sync({})
  .then(() => console.log("Database is connected successfully."))
  .catch((err) => console.error(err));
cloudinaryConfig();

// io
io.use(protectSocketMiddlware);
io.on("connection", onConnection);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));

// execute tasks
require("./utils/tasks");

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
