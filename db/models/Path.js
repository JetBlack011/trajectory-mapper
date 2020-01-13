var mongoose = require('mongoose')
var pathSchema = new mongoose.Schema({
    waypoints: []
}, {timestamps: true})
module.exports = mongoose.model('Path', pathSchema)