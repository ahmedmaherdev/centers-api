const qrcode = require('qrcode')

module.exports = async (token) => {
    return await qrcode.toDataURL(token)
}
