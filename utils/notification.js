const admin = require("firebase-admin");

const serviceAccount = require("../config/serviceAccount.json");

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
    const message = {
      notification: {
        title: this.title,
        body: this.body,
      },
      data: { data: JSON.stringify(this.data) },
      tokens: this.deviceTokens,
    };
    return await admin.messaging().sendMulticast(message);
  }
}

module.exports = Notification;

// notification
// - renew subscribe  - done
// - new exam - done
// - new important advertisement - done
// - new note - done
