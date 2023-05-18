const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Message = db.define("Message", {
    sender: {
      type: DataTypes.ENUM("center", "student"),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Message.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });

  Message.belongsTo(db.Rooms, {
    as: "room",
    foreignKey: {
      name: "roomId",
      allowNull: false,
    },
  });

  return Message;
};
