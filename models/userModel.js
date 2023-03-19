const { DataTypes } = require("sequelize");
const { isMobilePhone, isStrongPassword } = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (db) => {
  const User = db.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100],
          // msg: "name must be more than 6 characters and less than 100 characters.",
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [10, 200],
        },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          customValidator(value) {
            if (!isMobilePhone(value, "ar-EG"))
              throw new Error("Invalid phone number.");
          },
          len: [10, 200],
        },
      },

      role: {
        type: DataTypes.ENUM("student", "parent", "manager", "admin"),
        defaultValue: "student",
      },

      photo: {
        type: DataTypes.STRING,
        defaultValue: "userPhotos/default_p8adw7",
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isSuspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      password: {
        type: DataTypes.STRING,
        validate: {
          len: [8, 60],
          customValidator(value) {
            if (
              !isStrongPassword(value, {
                minSymbols: 0,
              })
            )
              throw new Error(
                "This password must have at least 1 uppercase character and 1 lowercase character and numbers."
              );
          },
        },
      },
      passwordChangedAt: DataTypes.DATE,
      passwordResetToken: DataTypes.STRING,
      passwordResetExpires: DataTypes.DATE,
    },
    {
      hooks: {
        beforeSave: async function (user, options) {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12);
          }

          if (user.phone.startsWith("2")) {
            user.phone = user.phone.slice(1);
          }
        },

        afterSave: function (user, options) {
          user.password = undefined;
        },
      },

      indexes: [
        {
          type: "FULLTEXT",
          name: "name_fulltext",
          fields: ["name"],
        },
      ],

      defaultScope: {
        where: {
          isActive: true,
        },
        attributes: {
          exclude: [
            "password",
            "isSuspended",
            "isActive",
            "passwordChangedAt",
            "passwordResetToken",
            "passwordResetExpires",
          ],
        },

        include: [{ model: db.Students, as: "student" }],
      },
    }
  );

  User.prototype.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(userPassword, candidatePassword);
  };

  User.prototype.isPasswordChangedAfter = function (iat) {
    return this.passwordChangedAt
      ? parseInt(new Date(this.passwordChangedAt).getTime() / 1000, 10) > iat
      : false;
  };

  User.prototype.createPasswordResetToken = function (
    expiredTime = 30 * 60 * 1000 // 30 mins
  ) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + expiredTime;
    return resetToken;
  };

  User.searchedAttributes = ["name"];

  User.belongsTo(db.Students, {
    as: "student",
    foreignKey: "studentId",
  });

  db.Students.hasOne(User, {
    as: "user",
    foreignKey: "studentId",
  });
  return User;
};
