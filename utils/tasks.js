const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("../models");
const Logger = require("../services/Logger");
const tasksLogger = new Logger("tasks");
const fs = require("fs/promises");
const path = require("path");

// second minute hour dayOfMonth(1-31) month dayOfWeek(0-7)

// every friday hour 3:00 AM
exports.deleteAllExpiredAdvertisements = cron.schedule(
  "0 0 3 * * Friday",
  async () => {
    try {
      const data = await db.Advertisements.destroy({
        where: {
          expiredAt: {
            [Op.lt]: new Date(Date.now()),
          },
        },
      });
      tasksLogger.info(
        "local",
        `Delete All expired advertisements tasks finished: ${data} rows deleted.`
      );
    } catch (error) {
      console.log(error);
      tasksLogger.error("local", error.message);
    }
  }
);

// every Friday hour 4:00 AM
exports.clearLogs = cron.schedule("0 0 4 * * Friday", async () => {
  try {
    const logsFolder = path.join(__dirname, "..", "logs");
    const logsFiles = await fs.readdir(logsFolder);
    for (const file of logsFiles) {
      await fs.unlink(path.join(logsFolder, file));
    }

    tasksLogger.info(
      "local",
      `Clear logs task finished: ${logsFiles.length} files deleted.`
    );
  } catch (error) {
    console.log(error);
    tasksLogger.error("local", error.message);
  }
});
