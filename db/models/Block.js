var mongoose = require('mongoose')
var blockSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})
module.exports = mongoose.model('Block', blockSchema)