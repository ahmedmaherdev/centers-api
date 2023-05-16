const { DataTypes } = require("sequelize");

module.exports = (db) => {
  const Message = db.define("Message", {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Message.belongsTo(db.Users, {
    as: "from",
    foreignKey: {
      name: "fromId",
      allowNull: true,
    },
  });

  Message.belongsTo(db.Users, {
    as: "to",
    foreignKey: {
      name: "toId",
      allowNull: true,
    },
  });

  Message.belongsTo(db.Users, {
    as: "createdBy",
    foreignKey: {
      name: "createdById",
      allowNull: false,
    },
  });

  return Message;
};
