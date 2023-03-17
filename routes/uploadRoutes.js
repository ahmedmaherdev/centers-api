const express = require('express')
const router = express.Router()
const upload = require('../controllers/uploadController')
const protect = require('../controllers/authController/protect')

router.use(protect)

router.get('/generateSignature', upload.generateSignature)

module.exports = router
