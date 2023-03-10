// const express = require('express')
// const router = express.Router()
// const users = require('../controllers/userController')
// const restrictTo = require('../utils/restrictTo')
// const protect = require('../controllers/authController/protect')

// router.use(protect)

// router.get('/getMe', users.getMeMiddleware, users.getMe)
// router.patch('/updateMe', users.updateMeMiddleware, users.updateMe)
// router.patch(
//     '/updateMyPhoto',
//     users.updateMyPhotoMiddleware,
//     users.updateMyPhoto
// )
// router.delete('/deleteMe', users.deleteMeMiddleware, users.deleteMe)

// router.use(restrictTo('admin'))

// router.route('/').get(users.getAllUsers).post(users.createUser)
// router.get('/search', users.searchUser)
// router
//     .route('/:id')
//     .get(users.getUser)
//     .patch(users.updateUser)
//     .delete(users.deleteUser)

// module.exports = router
