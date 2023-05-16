const catchAsync = require("../utils/catchAsync");
const appFeatures = require("../utils/appFeatures");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../utils/Sender");
const { literal } = require("sequelize");

exports.getAll = (Model, Logger) =>
  catchAsync(async (req, res, next) => {
    const tableName = Model.tableName.toLowerCase();
    const featuresBeforePagination = new appFeatures(req.query).filter();
    const features = new appFeatures(req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();

    if (req.filterObj) {
      featuresBeforePagination.query.where = {
        ...featuresBeforePagination.query.where,
        ...req.filterObj,
      };

      features.query.where = {
        ...features.query.where,
        ...req.filterObj,
      };
    }

    const allCount = await Model.count({
      distinct: true,
      col: `${Model.name}.id`,
      ...featuresBeforePagination.query,
    });

    const data = await Model.findAll({
      ...features.query,
    });

    // logging data
    if (Logger) {
      const logMsg = req.user
        ? `${req.method} ${req.originalUrl} |  ${req.user.role} ${req.user.name} find all ${tableName}.`
        : `${req.method} ${req.originalUrl} |  find all ${tableName}.`;
      Logger.info(req.ip, logMsg);
    }
    Sender.send(
      res,
      StatusCodes.OK,
      {
        [tableName]: data,
      },
      {
        allCount,
        count: data.length,
      }
    );
  });

exports.getOne = (Model, Logger) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const data = await Model.findByPk(id, req.includedObj);
    const modelName = Model.name.toLowerCase();
    if (!data) {
      if (Logger)
        Logger.error(
          req.ip,
          `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.NOT_FOUND} | ${modelName} is not found.`
        );
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }

    // Logging data
    if (Logger) {
      const logMsg = req.user
        ? `${req.method} ${req.originalUrl} | ${req.user.role} ${req.user.name} find one ${modelName} by id: ${req.params.id}.`
        : `${req.method} ${req.originalUrl} | find one ${modelName} by id: ${req.params.id}.`;
      Logger.info(req.ip, logMsg);
    }
    Sender.send(res, StatusCodes.OK, {
      [modelName]: data,
    });
  });

exports.createOne = (Model, Logger) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    const modelName = Model.name.toLowerCase();

    // Logging data
    if (Logger) {
      const logMsg = `${req.method} ${req.originalUrl} | ${req.user.role} ${
        req.user.name
      } create one ${modelName} with data: ${JSON.stringify(data)}.`;
      Logger.info(req.ip, logMsg);
    }
    Sender.send(res, StatusCodes.CREATED, {
      [modelName]: data,
    });

    if (req.isHasNotification) {
      // pass created object to send notification
      req.createdData = data;
      next();
    }
  });

exports.updateOne = (Model, Logger) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let data = await Model.update(req.body, {
      where: { id },
    });

    data = await Model.findByPk(id);
    const modelName = Model.name.toLowerCase();
    if (!data) {
      if (Logger)
        Logger.error(
          req.ip,
          `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.NOT_FOUND} | ${modelName} is not found.`
        );
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }

    if (Logger) {
      const logMsg = `${req.method} ${req.originalUrl} | ${req.user.role} ${
        req.user.name
      } update one ${modelName} by id: ${
        req.params.id
      } with data: ${JSON.stringify(data)}.`;
      Logger.info(req.ip, logMsg);
    }

    Sender.send(res, StatusCodes.OK, {
      [modelName]: data,
    });
  });

exports.deleteOne = (Model, Logger) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const data = await Model.destroy({
      where: {
        id,
      },
    });
    const modelName = Model.name.toLowerCase();
    if (!data) {
      if (Logger)
        Logger.error(
          req.ip,
          `${req.method} ${req.originalUrl} | STATUS: ${StatusCodes.NOT_FOUND} | ${modelName} is not found.`
        );
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }

    // Logging data
    if (Logger) {
      const logMsg = `${req.method} ${req.originalUrl} | ${req.user.role} ${req.user.name} delete one ${modelName} by id: ${req.params.id}.`;
      Logger.warn(req.ip, logMsg);
    }
    Sender.send(res, StatusCodes.NO_CONTENT);
  });

exports.search = (Model) =>
  catchAsync(async (req, res, next) => {
    const { s } = req.query;
    const data = await Model.findAll({
      where: literal(
        `MATCH (${Model.searchedAttributes.join(",")}) AGAINST ('${s}')`
      ),

      limit: 10,
    });
    const tableName = Model.tableName.toLowerCase();

    Sender.send(
      res,
      StatusCodes.OK,
      {
        [tableName]: data,
      },
      {
        count: data.length,
      }
    );
  });
