const mongoose = require('mongoose')

const { Schema } = mongoose;
const interViewSchema = new Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    interviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roleName: {
        type: String
    },
    candidateRating: [{
        topicName: {
            type: String
        },
        topicRating: {
            type: Number,
            default: 0
        }
    }],
    interviewerfriendly: {
        type: Number,
        default: 0
    },
    interviewerknowledge: {
        type: Number,
        default: 0
    }
});


mongoose.models = {}
const Interview = mongoose.model('Interview', interViewSchema)
module.exports = Interview