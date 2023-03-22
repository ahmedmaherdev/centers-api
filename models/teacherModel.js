const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Teacher = db.define("Teacher", {
    name: {
      type: DataTypes.STRING,
      len: [5, 100],
    },

    photo: {
      type: DataTypes.STRING,
      defaultValue: "userPhotos/default_p8adw7",
    },
  });

  return Teacher;
};
