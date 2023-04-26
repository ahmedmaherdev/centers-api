var admin = require("firebase-admin");

var serviceAccount = require("../config/serviceAccount.json");

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
      tokens: this.deviceTokens,
    };
    return await admin.messaging().sendMulticast(message);
  }
}

module.exports = Notification;

// notification
// - renew subscribe
// - new exam
// - new important advertisement
// - new note
