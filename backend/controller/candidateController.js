const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const generateToken = require('../config/generateToken')
require('dotenv').config();
const AWS = require('aws-sdk');
const Role = require('../models/Role');
const Interview = require('../models/Interview');
const pdf = require('pdf-parse');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const path = require('path');
const fs = require('fs');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, wanumber } = req.body
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!name && !email && !password) {
        res.status(400).json({ success: false, message: "Please Enter all The Fields!" });
        return;
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        res.status(400).json({ success: false, message: "User Already Exists! Please Login" });
        return
    }
    else {
        const pdfBuffer = req.file.buffer;
        let filetext = null;
        pdf(pdfBuffer).then(function (data) {
            filetext = data.text;
        });
        const roles = await Role.find({ __v: 0 })
        let elgibleroles = [];
        roles.forEach(role => {
            const technologies = role.technologies.split(',').map(tech => tech.trim().toLowerCase());
            const lowercaseFiletext = filetext.toLowerCase();

            if (technologies.some(tech => lowercaseFiletext.includes(tech))) {
                elgibleroles.push(role._id);
            }
        });
        const picture = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/271deea8-e28c-41a3-aaf5-2913f5f48be6/de7834s-6515bd40-8b2c-4dc6-a843-5ac1a95a8b55.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI3MWRlZWE4LWUyOGMtNDFhMy1hYWY1LTI5MTNmNWY0OGJlNlwvZGU3ODM0cy02NTE1YmQ0MC04YjJjLTRkYzYtYTg0My01YWMxYTk1YThiNTUuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.BopkDn1ptIwbmcKHdAOlYHyAOOACXW0Zfgbs0-6BY-E"
        const user = await User.create({ name, email, password, picture, waNumber: wanumber, eligibleRoles: elgibleroles })
        const userResponse = {
            ...user.toJSON(),
            password: undefined,
        };
        if (user) {
            const token = await generateToken(user._id)
            res.status(200).json({ success: true, message: "User Created Successfully! Redirecting...", token, user: userResponse });
        }
        else {
            res.status(400).json({ success: false, message: "Unable to create user!" });
        }
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email && !password) {
        res.status(400).json({ success: false, message: "Please Enter all The Fields!" });
        return;
    }
    const user = await User.findOne({ email: email });
    if (user) {
        if (user.password === password) {
            const token = await generateToken(user._id)
            const userResponse = {
                ...user.toJSON(),
                password: undefined,
            };
            res.status(200).json({ success: true, message: "Login successful", token, user: userResponse });
        }
        else {
            res.status(400).json({ success: false, message: "Invalid Credentials!" });
        }
    }
    else {
        res.status(400).json({ success: false, message: "Invalid Credentials!" });
    }
})

const registerFace = asyncHandler(async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id)
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.ACCESS_SECRET,
            region: 'ap-south-1'
        })

        const rekognition = new AWS.Rekognition();
        rekognition.listCollections(async (err, data) => {
            if (err) {
                res.status(500);
                return;
            }
            if (data.CollectionIds.includes(process.env.FACE_COLLECTION)) {
                if (!user.hasUserId) {
                    rekognition.createUser({
                        "CollectionId": process.env.FACE_COLLECTION,
                        "UserId": id
                    }, async (err, data) => {
                        if (err) {
                            res.status(400);
                            return;
                        }
                        rekognition.indexFaces({
                            Image: {
                                "Bytes": req.file.buffer
                            },
                            CollectionId: process.env.FACE_COLLECTION,
                            MaxFaces: 1,
                            QualityFilter: "AUTO",
                        }, async (err, data) => {
                            if (err) {
                                res.status(400);
                                return;
                            }
                            rekognition.associateFaces({
                                "CollectionId": process.env.FACE_COLLECTION,
                                "UserId": id,
                                "FaceIds": [data.FaceRecords[0].Face.FaceId]
                            }, async (err, data) => {
                                if (err) {
                                    res.status(400);
                                    return;
                                }
                                if (data.AssociatedFaces.length > 0) {
                                    const newuser = await User.findByIdAndUpdate(id, {
                                        hasUserId: true,
                                        associatedFaces: data.AssociatedFaces.length
                                    }, { new: true }).select("-password")
                                    res.json({ success: true, message: "Uploaded!", user: newuser })
                                    return;
                                }
                                else {
                                    console.log("No Associated Faces")
                                    res.status(400).json({ success: false })
                                    return;
                                }
                            })
                        })
                    })
                }
                else {
                    res.json({ success: false, message: "Already Uploaded!" });
                }
            }
            else {
                rekognition.createCollection({ CollectionId: process.env.FACE_COLLECTION }, async (err, data) => {
                    if (err) {
                        res.status(500);
                        return;
                    }
                    if (!user.hasUserId) {
                        rekognition.createUser({
                            "CollectionId": process.env.FACE_COLLECTION,
                            "UserId": id
                        }, async (err, data) => {
                            if (err) {
                                res.status(400);
                                return;
                            }
                            rekognition.indexFaces({
                                Image: {
                                    "Bytes": req.file.buffer
                                },
                                CollectionId: process.env.FACE_COLLECTION,
                                MaxFaces: 1,
                                QualityFilter: "AUTO",
                            }, async (err, data) => {
                                if (err) {
                                    res.status(400);
                                    return;
                                }
                                rekognition.associateFaces({
                                    "CollectionId": process.env.FACE_COLLECTION,
                                    "UserId": id,
                                    "FaceIds": [data.FaceRecords[0].Face.FaceId]
                                }, async (err, data) => {
                                    if (err) {
                                        res.status(400);
                                        return;
                                    }
                                    if (data.AssociatedFaces.length > 0) {
                                        const newuser = await User.findByIdAndUpdate(id, {
                                            hasUserId: true,
                                            associatedFaces: data.AssociatedFaces.length
                                        }, { new: true }).select("-password")
                                        res.json({ success: true, message: "Uploaded!", user: newuser })
                                        return;
                                    }
                                    else {
                                        console.log("No Associated Faces")
                                        res.status(400).json({ success: false })
                                        return;
                                    }
                                })
                            })
                        })
                    }
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error })
    }
})

const addInterest = asyncHandler(async (req, res) => {
    let { roleid, number } = req.body
    try {
        const role = await Role.findById(roleid)
        if (role.interests) {
            let previousintestest = role.interests
            previousintestest.push({
                waNumber: number
            })
            const newRole = await Role.findByIdAndUpdate(roleid, { interests: previousintestest })
            res.status(200).json({ success: true, message: "Interest added successfully!", role: newRole });
        }
    } catch (error) {
        console.log(error)
    }
})

const compileTemplate = async (templateName, data) => {
    const filepath = path.join(__dirname, `../template/${templateName}.hbs`);
    const html = fs.readFileSync(filepath, 'utf-8');
    return hbs.compile(html)(data);
}

const submitreview = asyncHandler(async (req, res) => {
    const {interviewid, friendlyrating, knowlegerating} = req.body;

    const interview = await Interview.findByIdAndUpdate(interviewid, {
        interviewerfriendly: friendlyrating,
        interviewerknowledge: knowlegerating
    }).populate('candidate', "name");

    (async function () {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(await compileTemplate('certificate', interview.toObject()));
            await page.emulateMediaType('screen');
            const pdfBuffer = await page.pdf({
                path: undefined,
                format: 'A4',
                printBackground: true,
                width: '1040',
                height: '745.6',
                landscape: true,
            });
            
            res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
            
            await browser.close();
        }
        catch (error) {
            console.log(error)
        }
    })()
})

module.exports = { registerUser, loginUser, registerFace, addInterest, submitreview }