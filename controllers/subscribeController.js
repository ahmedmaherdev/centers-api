const db = require("../models");
const factoryHandler = require("./factoryHandler");

exports.getAllSubscribes = factoryHandler.getAll(db.Subscribes);

exports.getSubscribe = factoryHandler.getOne(db.Subscribes);

exports.createSubscribeMiddleware = (req, res, next) => {
  const { studentId } = req.body;
  const { id: userId } = req.user;
  req.body = {
    studentId,
    createdById: userId,
  };
  next();
};

exports.createSubscribe = factoryHandler.createOne(db.Subscribes);

exports.deleteSubscribe = factoryHandler.deleteOne(db.Subscribes);
