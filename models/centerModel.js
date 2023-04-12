const { DataTypes } = require("sequelize");
const { isMobilePhone } = require("validator");

module.exports = (db) => {
  const Center = db.define("Center", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        customValidator(value) {
          if (!isMobilePhone(value, "ar-EG"))
            throw new Error("invalid phone number.");
        },
      },
    },

    location: {
      type: DataTypes.JSON,
      get() {
        let location = this.getDataValue("location");
        return typeof location === "string" ? JSON.parse(location) : location;
      },
    },
  });

  return Center;
};
