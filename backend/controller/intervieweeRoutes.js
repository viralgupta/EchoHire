const express = require('express')
const { confirmUser, addRole, addAvailability, removeAvailability, getRoles, getRole, submitReview } = require('./intervieweeController')
const { protect } = require('../middlewear/authMiddleware')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const interviewee = express.Router()

interviewee.route('/getRoles').get(getRoles)
interviewee.route('/getRole').post(getRole)
interviewee.route('/addRole').post(protect, addRole)
interviewee.route('/addAvailability').post(protect, addAvailability)
interviewee.route('/removeAvailability').post(protect, removeAvailability)
interviewee.route('/confirmuser').post(upload.single('fileContent'), confirmUser)
interviewee.route('/submitreview').post(protect,submitReview)

module.exports = interviewee



