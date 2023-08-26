const db = require("../models");
const factoryHandler = require("./factoryHandler");
const cloudinary = require("../utils/cloudinary");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const userValidator = require("../validators/userValidator");
const stringToNumber = require("../utils/stringToNumber");
const catchAsync = require("../utils/catchAsync");
const config = require("../config");
const Sender = require("../services/Sender");

exports.getAllUsersMiddleware = (req, res, next) => {
  const { role: userRole } = req.user;

  if (userRole === "admin") {
    req.includedObj = {
      attributes: {
        include: ["email", "phone", "isSuspended"],
      },
    };
  }

  next();
};

exports.getAllUsers = factoryHandler.getAll(db.Users);

exports.getUser = factoryHandler.getOne(db.Users);

exports.createUserMiddleware = (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  const result = userValidator.createUser.validate(req.body);
  if (result.error)
    return next(
      new AppError(result.error.details[0].message),
      StatusCodes.BAD_REQUEST
    );
  req.body = { name, email, phone, role, password };
  next();
};
exports.createUser = factoryHandler.createOne(db.Users);

exports.updateUserMiddleware = (req, res, next) => {
  const { name, email, phone, role } = req.body;
  const result = userValidator.updateUser.validate(req.body);
  if (result.error)
    return next(
      new AppError(result.error.details[0].message),
      StatusCodes.BAD_REQUEST
    );

  req.body = { name, email, phone, role };
  next();
};
exports.updateUser = factoryHandler.updateOne(db.Users);

exports.deleteUser = factoryHandler.deleteOne(db.Users);

exports.suspendUser = catchAsync(async (req, res, next) => {
  const { isSuspended, userId } = req.body;
  const user = await db.Users.findByPk(userId);
  if (!user) {
    return next(new AppError(`User is not found.`, StatusCodes.NOT_FOUND));
  }
  // check is the user is student and will be active his account
  if (isSuspended === false && user.role === "student") {
    // check if student is suspended because his absence
    user.student.maxAllowedAbsence =
      user.student.absence >= user.student.maxAllowedAbsence
        ? user.student.maxAllowedAbsence + config.maxAllowedAbsence
        : user.student.maxAllowedAbsence;
    await user.student.save();
  }
  user.isSuspended = isSuspended;
  await user.save();

  Sender.send(res, StatusCodes.OK, undefined, {
    message: `${user.role} ${user.name} suspend status changed successfully.`,
  });
});

exports.searchUserMiddleware = (req, res, next) => {
  const { role: userRole } = req.user;

  if (userRole === "admin") {
    req.includedObj = {
      attributes: {
        include: ["email", "phone", "isSuspended"],
      },

      // show student code for the admin.
      include: {
        model: db.Students,
        as: "student",
        attributes: {
          include: ["code"],
        },
      },
    };
  }

  next();
};

exports.searchUser = factoryHandler.search(db.Users);

exports.getMeMiddleware = (req, res, next) => {
  req.params.id = req.user.id;
  req.includedObj = {
    attributes: {
      include: ["email", "phone", "isSuspended"],
    },
  };
  next();
};

exports.getMe = factoryHandler.getOne(db.Users);

exports.updateMeMiddleware = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const result = userValidator.updateMe.validate(req.body);

  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }

  req.params.id = req.user.id;
  req.includedObj = {
    attributes: {
      include: ["email", "phone"],
    },
  };
  req.body = {
    name,
    email,
    phone,
  };

  next();
};

exports.updateMe = factoryHandler.updateOne(db.Users);

exports.deleteMeMiddleware = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = factoryHandler.deleteOne(db.Users);

exports.updateMyPhotoMiddleware = async (req, res, next) => {
  const { publicId } = req.body;
  req.params.id = req.user.id;

  try {
    await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });

    req.body = {
      photo: publicId,
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid public id.", StatusCodes.BAD_REQUEST));
  }
};

exports.updateMyPhoto = factoryHandler.updateOne(db.Users);

exports.updateMeAsStudentMiddleware = async (req, res, next) => {
  const { parentPhone, gender, schoolYearId, departmentId } = req.body;
  const result = userValidator.updateMe.validate(req.body);

  if (result.error) {
    return next(
      new AppError(result.error.details[0].message, StatusCodes.BAD_REQUEST)
    );
  }
  let code = stringToNumber(req.user.email);
  req.params.id = req.user.studentId;
  req.body = {
    parentPhone,
    gender,
    schoolYearId,
    departmentId,
    code,
  };

  next();
};

exports.updateMeAsStudent = factoryHandler.updateOne(db.Students);

exports.addMydeviceToken = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { deviceToken } = req.body;
  let userDeviceToken = await db.UserDeviceTokens.findOne({
    where: { userId },
  });

  if (!userDeviceToken) {
    userDeviceToken = await db.UserDeviceTokens.create({
      userId,
      deviceToken,
    });
  } else {
    userDeviceToken.deviceToken = deviceToken;
    await userDeviceToken.save();
  }

  Sender.send(res, StatusCodes.CREATED, {
    userDeviceToken,
  });
});
