const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./middlewares/errorMiddleware");

const app = express();

// App Routers
const routes = require("./routes");

// Global middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Cookie Parser
app.use(cookieParser());

app.set("trust proxy", 1);

app.use((req, res, next) => {
  console.log(`${req.ip} is logging....`);
  next();
});

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

// Mounting routers
app.use("/api/v1/auth", routes.Auth);
app.use("/api/v1/users", routes.User);
app.use("/api/v1/schoolYears", routes.SchoolYear);
app.use("/api/v1/departments", routes.Department);
app.use("/api/v1/subjects", routes.Subject);
app.use("/api/v1/teachers", routes.Teacher);
app.use("/api/v1/sections", routes.Section);
app.use("/api/v1/exams", routes.Exam);
app.use("/api/v1/grades", routes.Grade);
app.use("/api/v1/subscribes", routes.Subscribe);
app.use("/api/v1/centers", routes.Center);
app.use("/api/v1/notes", routes.Note);
app.use("/api/v1/advertisements", routes.Advertisement);
app.use("/api/v1/rooms", routes.Room);
app.use("/api/v1/upload", routes.Upload);

app.get("/", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Not Found",
  });
});
// all stands for all http methods
app.all("*", (req, res, next) => {
  //next(new AppError(`Can't find ${req.originalUrl} on the server`, 400))
  next(new AppError(`Can't find this route on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
