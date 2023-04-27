const db = require("../models");
const factoryHandler = require("./factoryHandler");
const Notification = require("../utils/notification");
const Logger = require("../utils/Logger");
const subscribeLogger = new Logger("subscribe");

exports.getAllSubscribes = factoryHandler.getAll(
  db.Subscribes,
  subscribeLogger
);

exports.getSubscribe = factoryHandler.getOne(db.Subscribes, subscribeLogger);

exports.createSubscribeMiddleware = (req, res, next) => {
  const { studentId } = req.body;
  const { id: userId } = req.user;
  req.body = {
    studentId,
    createdById: userId,
  };
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
