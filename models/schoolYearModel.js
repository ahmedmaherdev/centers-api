const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const SchoolYear = db.define("SchoolYear", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return SchoolYear;
};
