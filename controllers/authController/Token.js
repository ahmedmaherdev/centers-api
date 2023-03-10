const jwt = require("jsonwebtoken");

const daysToMS = require("../../utils/daysToMS");

class Token {
  sign(payload, expiresIn = process.env.JWT_EXPIRES_IN) {
    this.token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
    });

    return this.token;
  }

  sendUser(res, statusCode, user) {
    // generate token
    this.sign({ id: user.id });

    // set token on cookie
    const expiredDate = new Date(
      Date.now() + daysToMS(+process.env.JWT_EXPIRES_IN.slice(0, -1))
    );

    res.cookie("jwt", this.token, {
      expires: expiredDate,
    });

    user.password = undefined;
    user.isActive = undefined;
    user.isSuspended = undefined;

    // send response
    res.status(statusCode).send({
      status: "success",
      token: this.token,
      data: {
        user,
      },
    });
  }
}

module.exports = new Token();
