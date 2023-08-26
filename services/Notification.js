const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = class Notification {
  constructor(deviceTokens, data) {
    this.deviceTokens = deviceTokens;
    this.data = data;
  }

  setTitle(title) {
    this.title = title;
  }

  setBody(body) {
    this.body = body;
  }

  async send() {
    try {
      const message = {
        notification: {
          title: this.title,
          body: this.body,
        },
        data: { data: JSON.stringify(this.data) },
        tokens: this.deviceTokens,
      };
      return await admin.messaging().sendMulticast(message);
    } catch (error) {
      console.log(error);
    }
  }
};

// notification
// - renew subscribe  - done
// - new exam - done
// - new important advertisement - done
// - new note - done
