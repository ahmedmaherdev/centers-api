const catchAsync = require("../utils/catchAsync");
const appFeatures = require("../utils/appFeatures");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const Sender = require("../utils/Sender");
const { literal } = require("sequelize");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const tableName = Model.tableName.toLowerCase();
    const featuresBeforePagination = new appFeatures(req.query).filter();
    const features = new appFeatures(req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();

    const allCount = await Model.count(featuresBeforePagination.query);
    const data = await Model.findAll(features.query);

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

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const data = await Model.findByPk(id);
    const modelName = Model.name.toLowerCase();
    if (!data)
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    Sender.send(res, StatusCodes.OK, {
      [modelName]: data,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.create(req.body);
    const modelName = Model.name.toLowerCase();

    Sender.send(res, StatusCodes.CREATED, {
      [modelName]: data,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let data = await Model.update(req.body, { where: { id } });

    data = await Model.findByPk(id);
    const modelName = Model.name.toLowerCase();
    if (!data)
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );

    Sender.send(res, StatusCodes.OK, {
      [modelName]: data,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const data = await Model.destroy({
      where: {
        id,
      },
    });
    console.log(data);
    const modelName = Model.name.toLowerCase();
    if (!data)
      return next(
        new AppError(`${modelName} is not found`, StatusCodes.NOT_FOUND)
      );

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
