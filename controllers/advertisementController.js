const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../errors/AppError");
const { StatusCodes } = require("http-status-codes");
const advertisementValidator = require("../validators/advertisementValidator");
const Notification = require("../services/Notification");
const Logger = require("../services/Logger");
const advertisementLogger = new Logger("advertisement");

exports.getAllAdvertisements = factoryHandler.getAll(
  db.Advertisements,
  advertisementLogger
);

exports.getAdvertisement = factoryHandler.getOne(
  db.Advertisements,
  advertisementLogger
);

exports.createAdvertisementMiddleware = (req, res, next) => {
  const result = advertisementValidator.createAdvertisement.validate(req.body);
  if (result.error) {
    advertisementLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  req.isHasNotification = true;
  next();
};
exports.createAdvertisement = factoryHandler.createOne(
  db.Advertisements,
  advertisementLogger
);

exports.createAdvertisementNotification = async (req, res, next) => {
  // notification here
  try {
    const { id, departmentId, pirority } = req.createdData;
    // do not send notification if pirority is not important
    if (pirority !== "important") return next();

    // find all students that department belongs to schoolYear of advertisement
    let studentsDeviceTokens = await db.UserDeviceTokens.findAll({
      include: {
        as: "user",
        model: db.Users,
        where: { role: "student" },
        include: {
          as: "student",
          model: db.Students,
          where: { departmentId },
        },
      },
    });

    studentsDeviceTokens = studentsDeviceTokens.map((stud) => stud.deviceToken);
    if (studentsDeviceTokens.length > 0) {
      const type = "advertisement";
      const advertisementNotification = new Notification(studentsDeviceTokens, {
        type,
        id,
      });

      advertisementNotification.setTitle("اعلان");
      advertisementNotification.setBody(`انت لديك اعلان مهم`);

      const res = await advertisementNotification.send();
      advertisementLogger.info(
        req.ip,
        `advertisement notification sent: ${JSON.stringify(res)}`
      );
    }
  } catch (error) {
    advertisementLogger.error(
      req.ip,
      `advertisement notification failed: ${error.message}`
    );
  }
};

exports.updateAdvertisementMiddleware = (req, res, next) => {
  const result = advertisementValidator.updateAdvertisement.validate(req.body);
  if (result.error) {
    advertisementLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  next();
};
exports.updateAdvertisement = factoryHandler.updateOne(
  db.Advertisements,
  advertisementLogger
);

exports.deleteAdvertisement = factoryHandler.deleteOne(
  db.Advertisements,
  advertisementLogger
);
