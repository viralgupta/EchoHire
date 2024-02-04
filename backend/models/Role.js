const mongoose = require('mongoose')

const { Schema } = mongoose;
const roleSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    technologies: {
        type: String,
        required: true
    },
    roomId: {
        type: String
    },
    interests: [
        {
            waNumber: {
                type: Number
            },
        }
    ],
    topics: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }]
});


mongoose.models = {}
const Role = mongoose.model('Role', roleSchema)
module.exports = Role