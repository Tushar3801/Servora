const mongo = require('mongoose');
const workers = new mongo.Schema({
    user: {
        type: mongo.Schema.Types.ObjectId,
        ref: "user",
  default: null
    },services: [{
  type: mongo.Schema.Types.ObjectId,
  ref: "services"
}],
    name: String,
    skill: String,
    experience: Number,
    location: String,
    hourlyRate: Number,
    availability: Boolean,
    description: String
});
const worker = mongo.model("workers", workers);
module.exports = worker;