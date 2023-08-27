const db = require("../models");
const factoryHandler = require("./factoryHandler");
const Notification = require("../services/Notification");
const Logger = require("../services/Logger");
const subscribeLogger = new Logger("subscribe");
const moment = require("moment");
const subscribeValidator = require("../validators/subscribeValidator");

exports.getAllSubscribes = factoryHandler.getAll(
  db.Subscribes,
  subscribeLogger
);

exports.getSubscribe = factoryHandler.getOne(db.Subscribes, subscribeLogger);

exports.createSubscribeMiddleware = (req, res, next) => {
  const result = subscribeValidator.createSubscribe.validate(req.body);
  if (result.error) {
    advertisementLogger.error(
      req.ip,
      `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.BAD_REQUEST} | ${result.error.details[0].message}`
    );
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  const { studentId } = req.body;
  const { id: userId } = req.user;
  req.body = {
    studentId,
    createdById: userId,
  };

  req.isHasNotification = true;
  next();
};

exports.createSubscribe = factoryHandler.createOne(
  db.Subscribes,
  subscribeLogger
);

exports.createSubscribeNotification = async (req, res, next) => {
  try {
    const { id, studentId, subscribedTill } = req.createdData;
    const type = "subscribe";
    // notification here
    let userDeviceTokens = await db.UserDeviceTokens.findAll({
      where: { userId: studentId },
      attributes: ["deviceToken"],
    });

    userDeviceTokens = userDeviceTokens.map((obj) => obj.deviceToken);
    if (userDeviceTokens.length > 0) {
      const subscribeNotification = new Notification(userDeviceTokens, {
        id,
        studentId,
        type,
        subscribedTill,
      });

      subscribeNotification.setTitle("الاشتراك");
      subscribeNotification.setBody(
        `${moment(subscribedTill).format(
          "DD-MM-YYYY"
        )} لقد تم اشتراكك بنجاح حتى`
      );

      const res = await subscribeNotification.send();
      subscribeLogger.info(
        req.ip,
        `subscribe notification sent: ${JSON.stringify(res)}`
      );
    }
  } catch (error) {
    subscribeLogger.error(
      req.ip,
      `subscribe notification failed: ${error.message}`
    );
  }
};

exports.deleteSubscribe = factoryHandler.deleteOne(
  db.Subscribes,
  subscribeLogger
);
