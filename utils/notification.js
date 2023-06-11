const admin = require("firebase-admin");

const serviceAccount = require("../config/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class Notification {
  constructor(deviceTokens, data) {
    this.deviceTokens = deviceTokens;
    this.data = data;
  }

  async send() {
    const message = {
      notification: {
        title: `New ${this.data.type}`,
        body: `You have a new ${this.data.type}`,
      },
      data: { data: JSON.stringify(this.data) },
      // token: this.deviceTokens[0],
      topic: `${this.data.type}-1`,
    };
    return await admin.messaging().send(message);
  }
}

module.exports = Notification;

// notification
// - renew subscribe  - done
// - new exam - done
// - new important advertisement - done
// - new note - done
