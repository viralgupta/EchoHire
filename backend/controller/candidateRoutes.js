const express = require('express')
const {registerUser, loginUser, registerFace, addInterest, submitreview} = require('./candidateController')
const {protect} = require('../middlewear/authMiddleware')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const candidateRoute = express.Router()

candidateRoute.route('/signup').post( upload.single('file'), registerUser)
candidateRoute.route('/login').post(loginUser)
candidateRoute.route('/registerface').post(protect, upload.single('fileContent'), registerFace)
candidateRoute.route('/addinterest').post(protect, addInterest)
candidateRoute.route('/submitreview').post(protect, submitreview)

module.exports = candidateRoute



