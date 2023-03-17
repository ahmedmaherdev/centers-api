const catchAsync = require('../utils/catchAsync')
const Sender = require('../utils/Sender')
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('../utils/cloudinary')

exports.generateSignature = catchAsync(async (req, res, next) => {
    const { signature, timestamp } = await cloudinary.createImageUpload()
    const URL = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/auto/upload?api_key=${process.env.API_KEY}&timestamp=${timestamp}&signature=${signature}`
    Sender.send(res, StatusCodes.OK, undefined, {
        url: URL,
    })
})
