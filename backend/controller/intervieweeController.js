const asyncHandler = require('express-async-handler')
const Role = require('../models/Role')
const Interview = require('../models/Interview')
const AWS = require('aws-sdk');
require('dotenv').config();

const getRole = asyncHandler(async (req, res) => {
    const { roleid } = req.body
    try {
        const role = await Role.findById(roleid)
        res.status(200).json({ success: true, message: "Role found successfully!", role: role })
    } catch (error) {
        console.log(error)
    }
})

const getRoles = asyncHandler(async (req, res) => {
    try {
        const roles = await Role.find({ __v: 0 })
        res.status(200).json({ success: true, message: "Roles found successfully!", roles: roles })
    } catch (error) {
        console.log(error)
    }
})

const addRole = asyncHandler(async (req, res) => {
    let { type, role, technologies, topics } = req.body
    try {
        topics = topics.filter(topic => topic.title !== null && topic.description !== null)
        const newRole = await Role.create({ type, role, technologies, topics })
        res.status(200).json({ success: true, message: "Role added successfully!", role: newRole });
    } catch (error) {
        console.log(error)
    }
})


const addAvailability = asyncHandler(async (req, res) => {
    const { roleid, roomId } = req.body
    try {
        const newRole = await Role.findByIdAndUpdate(roleid, {
            roomId: roomId
        })
        res.status(200).json({ success: true, message: "Availability added successfully!", role: newRole })
        const interests = newRole.interests;
        interests.forEach(async (interest) => {
            const data = {
                to: interest.waNumber,
                message: `Hello,\n\nAn interviewer is now available for the ${newRole.role} role. Please check the application for more details.`,
            };
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            };
            await fetch("http://localhost:8000/api/sendmessage", options)
        })
        await Role.findByIdAndUpdate(roleid, {
            interests: []
        })
    } catch (error) {
        console.log(error)
    }
})

const removeAvailability = asyncHandler(async (req, res) => {
    const { roleid } = req.body
    try {
        const newRole = await Role.findByIdAndUpdate(roleid, {
            roomId: null
        })
        res.status(200).json({ success: true, message: "Availability removed successfully!", role: newRole })
    } catch (error) {
        console.log(error)
    }
})

const confirmUser = asyncHandler(async (req, res) => {
    const { userid } = req.body;
    console.log(userid)
    try {
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.ACCESS_SECRET,
            region: 'ap-south-1'
        })

        const rekognition = new AWS.Rekognition()

        rekognition.listCollections((err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!data.CollectionIds.includes(process.env.FACE_COLLECTION)) {
                console.log("Coudnt find collection")
                return;
            }

            rekognition.searchUsersByImage({
                "CollectionId": process.env.FACE_COLLECTION,
                "Image": {
                    "Bytes": req.file.buffer
                },
                "MaxUsers": 1,
                "UserMatchThreshold": 95
            }, async (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (data.UserMatches.length > 0) {
                    console.log(data.UserMatches[0].User.UserId)
                    const matcheduserid = data.UserMatches[0].User.UserId
                    if (matcheduserid !== userid) {
                        res.status(200).json({ success: false, message: "Different User!" });
                        return;
                    }
                    res.status(200).json({ success: true, message: "User found!" });
                }
                else {
                    res.status(200).json({ success: false, message: "No User found!" });
                    return;
                }
            })
        })
    } catch (error) {
        console.log(error)
    }
})

const submitReview = asyncHandler(async (req, res) => {
    const { candidateId, interviewerid, topics, roleName } = req.body;

    const newInterview = await Interview.create({
        roleName: roleName,
        candidate: candidateId,
        interviewee: interviewerid,
        candidateRating: topics
    })

    res.status(200).json({ success: true, interview: newInterview._id })
})

module.exports = { confirmUser, addRole, addAvailability, removeAvailability, getRoles, getRole, submitReview }