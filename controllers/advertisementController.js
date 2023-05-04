const db = require("../models");
const factoryHandler = require("./factoryHandler");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const advertisementValidator = require("../validators/advertisementValidator");
const Notification = require("../utils/notification");
const Logger = require("../utils/Logger");
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
  next();
};
exports.createAdvertisement = factoryHandler.createOne(
  db.Advertisements,
  advertisementLogger
);

exports.createAdvertisementNotification = async (req, res, next) => {
  // notification here
  try {
    const { id, schoolYearId, pirority } = req.createdData;
    // do not send notification if pirority is not important
    if (pirority !== "important") return next();
    const type = "advertisement";
    const advertisementNotification = new Notification([], {
      type,
      id,
    });

    // find all students that department belongs to schoolYear of advertisement
    const students = await db.Users.findAll({
      where: {
        role: "student",
      },
      include: {
        as: "student",
        model: db.Students,
        where: {
          schoolYearId,
        },
      },
      attributes: ["id", "name"],
    });
    console.log(students);
    for (const student of students) {
      let userDeviceTokens = await db.UserDeviceTokens.findAll({
        where: { userId: student.id },
        attributes: ["deviceToken"],
      });
      userDeviceTokens = userDeviceTokens.map((obj) => obj.deviceToken);

      if (userDeviceTokens.length > 0) {
        advertisementNotification.deviceTokens = userDeviceTokens;
        const res = await advertisementNotification.send();
        advertisementLogger.info(
          req.ip,
          `advertisement notification sent: ${JSON.stringify(res)}`
        );
      }
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
