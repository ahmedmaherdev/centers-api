const { DataTypes } = require("sequelize");

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
      validate: {
        customValidator({ latitude, longitude }) {
          if (
            !latitude &&
            !longitude &&
            typeof latitude === "number" &&
            typeof longitude === "number"
          ) {
            throw new Error("invalid location.");
          }
        },
      },
    },
  });

  return Center;
};
