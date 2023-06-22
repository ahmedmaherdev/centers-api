const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccount.json");
const translate = require("./translate");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class Notification {
  constructor(deviceTokens, data) {
    this.deviceTokens = deviceTokens;
    this.data = data;
    this.title = `New ${this.data.type}`;
    this.body = `You have a new ${this.data.type}`;
  }

  async send() {
    try {
      const title = await translate(this.title);
      const body = await translate(this.body);
      const message = {
        notification: {
          title,
          body,
        },
        data: { data: JSON.stringify(this.data) },
        tokens: this.deviceTokens,
      };
      return await admin.messaging().sendMulticast(message);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Notification;

// notification
// - renew subscribe  - done
// - new exam - done
// - new important advertisement - done
// - new note - done
